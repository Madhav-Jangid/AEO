import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResponse, computeScore, extractCompetitors } from "@/lib/scoring";
import { callGroq } from "@/lib/ai/groq";
import { AVAILABLE_MODELS, getModelById } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

const PROMPT = (query: string) =>
  `A shopper is asking: "${query}". As an AI shopping assistant, what are your top recommendations? Be specific with product and brand names. List 5-7 recommended products or brands, numbered, with a brief explanation for each.`;

// ─── Provider call functions ──────────────────────────────────────────────────

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
  if (!res.ok) throw new Error(`Gemini API Error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error("gemini empty");
  return text;
}

async function callGPT(query: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) throw new Error("OPENAI_API_KEY is missing");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        { role: "system", content: "You are a helpful AI shopping assistant. Always respond with a numbered list." },
        { role: "user", content: PROMPT(query) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API Error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("gpt empty");
  return text;
}

async function callClaude(query: string): Promise<string> {
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
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 700,
      messages: [{ role: "user", content: PROMPT(query) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API Error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("claude empty");
  return text;
}

// ─── Dynamic dispatcher ───────────────────────────────────────────────────────

async function callModel(modelId: string, query: string): Promise<string> {
  const config = getModelById(modelId);
  if (!config) throw new Error(`Unknown model id: ${modelId}`);
  switch (config.provider) {
    case "groq":
      return callGroq(query, config.model);
    case "gemini":
      return callGemini(query, config.model);
    case "openai":
      return callGPT(query);
    case "anthropic":
      return callClaude(query);
    default:
      throw new Error(`No provider handler for: ${config.provider}`);
  }
}

function makeFallback(modelId: string, query: string): string {
  return `Here are my top recommendations for "${query}":\n\n1. Brand Alpha - Industry-leading option with proven results\n2. Brand Beta - Best value with strong customer reviews\n3. Brand Gamma - Premium quality trusted by experts\n4. Brand Delta - Most popular choice among consumers\n5. Brand Epsilon - Excellent performance at mid-range price`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      query?: string;
      brandName?: string;
      userId?: string;
      selectedModels?: string[];
    };
    const { query, brandName, userId, selectedModels } = body;

    if (!query?.trim() || !brandName?.trim()) {
      return NextResponse.json({ error: "query and brandName are required" }, { status: 400 });
    }

    // Resolve which models to run
    const defaultIds = AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id);
    const modelsToRun =
      selectedModels && selectedModels.length > 0 ? selectedModels : defaultIds;

    if (modelsToRun.length === 0) {
      return NextResponse.json({ error: "At least one model must be selected" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const { data: sessionData } = await supabase.auth.getSession();
    const user = userData?.user ?? sessionData?.session?.user ?? null;
    const finalUserId = user?.id || userId;

    console.log(`Scan: "${query}" | brand: "${brandName}" | models: ${modelsToRun.join(", ")}`);

    // Fan-out to all selected models simultaneously
    const results = await Promise.allSettled(
      modelsToRun.map((id) => callModel(id, query))
    );

    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.error(`${modelsToRun[i]} failed:`, r.reason);
    });

    const engines: EngineAnalysis[] = results.map((result, i) => {
      const modelId = modelsToRun[i];
      const text =
        result.status === "fulfilled" ? result.value : makeFallback(modelId, query);
      const isFallback = result.status === "rejected";
      return {
        engine: modelId,
        response: text,
        isFallback,
        ...analyzeResponse(text, brandName),
      };
    });

    const scores = computeScore(engines);
    const competitors = extractCompetitors(engines, brandName);
    const scoreData: ScoreData = { ...scores, engines, competitors };

    let scanId: string | null = null;
    if (finalUserId) {
      // Persist first engine responses under legacy column names for DB compat
      const gptEng = engines.find((e) => e.engine === "gpt");
      const claudeEng = engines.find((e) => e.engine === "claude");
      const geminiEng = engines.find((e) => e.engine === "gemini");
      // For non-legacy engine names, store response in first available columns
      const [e0, e1, e2] = engines;

      const { data, error } = await supabase
        .from("scans")
        .insert({
          user_id: finalUserId,
          query,
          brand_name: brandName,
          gpt_response: gptEng?.response ?? e0?.response ?? null,
          claude_response: claudeEng?.response ?? e1?.response ?? null,
          gemini_response: geminiEng?.response ?? e2?.response ?? null,
          score_data: scoreData,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Failed to insert scan:", error);
      } else {
        scanId = data?.id ?? null;
        console.log("Scan saved:", scanId);
      }
    }

    return NextResponse.json({ scanId, query, brandName, scoreData });
  } catch (err) {
    console.error("scan error:", err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
