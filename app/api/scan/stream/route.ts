import { createClient } from "@/lib/supabase/server";
import { analyzeResponse, computeScore, extractCompetitors } from "@/lib/scoring";
import { callGroq } from "@/lib/ai/groq";
import { AVAILABLE_MODELS, getModelById } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

const PROMPT = (query: string) =>
  `A shopper is asking: "${query}". As an AI shopping assistant, what are your top recommendations? Be specific with product and brand names. List 5-7 recommended products or brands, numbered, with a brief explanation for each.`;

// ─── Provider dispatch ────────────────────────────────────────────────────────

async function callGemini(query: string, modelName: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT(query) }] }] }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

async function callGPT(query: string, modelName: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) throw new Error("OPENAI_API_KEY is missing");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: modelName,
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        { role: "system", content: "You are a helpful AI shopping assistant. Always respond with a numbered list." },
        { role: "user", content: PROMPT(query) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("GPT returned empty response");
  return text;
}

async function callClaude(query: string, modelName: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTROPIC_API_KEY;
  if (!apiKey?.trim()) throw new Error("ANTHROPIC_API_KEY is missing");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelName,
      max_tokens: 700,
      messages: [{ role: "user", content: PROMPT(query) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("Claude returned empty response");
  return text;
}

async function callModel(modelId: string, query: string): Promise<string> {
  const config = getModelById(modelId);
  if (!config) throw new Error(`Unknown model: ${modelId}`);
  switch (config.provider) {
    case "groq":      return callGroq(query, config.model);
    case "gemini":    return callGemini(query, config.model);
    case "openai":    return callGPT(query, config.model);
    case "anthropic": return callClaude(query, config.model);
    default: throw new Error(`No handler for provider: ${config.provider}`);
  }
}

// ─── Streaming route ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const body = (await req.json()) as {
    query?: string;
    brandName?: string;
    userId?: string;
    selectedModels?: string[];
  };
  const { query, brandName, userId: passedUserId, selectedModels } = body;

  if (!query?.trim() || !brandName?.trim()) {
    return Response.json({ error: "query and brandName are required" }, { status: 400 });
  }

  // ── Resolve auth BEFORE starting the stream ──
  // Must happen here in the route handler scope where cookies() context is live.
  // getUser() contacts Supabase Auth to verify the JWT — secure and reliable here.
  let finalUserId: string | null = passedUserId?.trim() || null;
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  try {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) finalUserId = user.id;
  } catch (e) {
    console.error("Auth init error:", e);
  }

  const defaultIds = AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id);
  const modelsToRun = selectedModels && selectedModels.length > 0 ? selectedModels : defaultIds;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const promises = modelsToRun.map((modelId) =>
          callModel(modelId, query)
            .then((text) => {
              const eng: EngineAnalysis = {
                engine: modelId,
                response: text,
                isFallback: false,
                ...analyzeResponse(text, brandName),
              };
              send({ type: "engine", data: eng });
              return eng;
            })
            .catch((err) => {
              console.error(`${modelId} failed:`, err.message);
              const eng: EngineAnalysis = {
                engine: modelId,
                response: "",
                isFallback: true,
                mentioned: false,
                position: null,
                sentiment: null,
                competitors: [],
              };
              send({ type: "engine_error", modelId, error: err.message, data: eng });
              return eng;
            })
        );

        const engines = await Promise.all(promises);
        const validEngines = engines.filter((e) => !e.isFallback);
        const scores = computeScore(validEngines.length > 0 ? validEngines : engines);
        const competitors = extractCompetitors(engines, brandName);
        const scoreData: ScoreData = { ...scores, engines, competitors };

        // ── DB save using the pre-resolved client (cookies captured before stream) ──
        let scanId: string | null = null;
        if (finalUserId && supabase) {
          try {
            const [e0, e1, e2] = engines;
            const { data: row, error: dbErr } = await supabase
              .from("scans")
              .insert({
                user_id: finalUserId,
                query,
                brand_name: brandName,
                gpt_response: engines.find((e) => e.engine === "gpt")?.response ?? e0?.response ?? null,
                claude_response: engines.find((e) => e.engine === "claude")?.response ?? e1?.response ?? null,
                gemini_response: engines.find((e) => e.engine === "gemini")?.response ?? e2?.response ?? null,
                score_data: scoreData,
              })
              .select("id")
              .single();
            if (dbErr) console.error("DB save error:", dbErr.message);
            else scanId = row?.id ?? null;
          } catch (dbErr) {
            console.error("DB save exception:", dbErr);
          }
        }

        send({ type: "complete", scanId, scoreData });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
