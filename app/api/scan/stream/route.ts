import { createClient } from "@/lib/supabase/server";
import { analyzeResponse, computeScore, extractCompetitors } from "@/lib/scoring";
import { callModel } from "@/lib/ai/provider";
import { saveScan } from "@/lib/data";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

export async function POST(req: Request) {
  const { query, brandName, selectedModels } = (await req.json()) as {
    query?: string;
    brandName?: string;
    selectedModels?: string[];
  };

  if (!query?.trim() || !brandName?.trim()) {
    return Response.json({ error: "query and brandName are required" }, { status: 400 });
  }

  let userId: string | null = null;
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  try {
    supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) userId = user.id;
  } catch {
    // scan proceeds without saving
  }

  const defaultIds = AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id);
  const modelsToRun = selectedModels?.length ? selectedModels : defaultIds;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        const engines = await Promise.all(
          modelsToRun.map((modelId) =>
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
                const eng: EngineAnalysis = {
                  engine: modelId,
                  response: "",
                  isFallback: true,
                  mentioned: false,
                  position: null,
                  sentiment: null,
                  competitors: [],
                };
                send({ type: "engine_error", modelId, error: (err as Error).message, data: eng });
                return eng;
              })
          )
        );

        const validEngines = engines.filter((e) => !e.isFallback);
        const scores = computeScore(validEngines.length > 0 ? validEngines : engines);
        const competitors = extractCompetitors(engines, brandName);
        const scoreData: ScoreData = { ...scores, engines, competitors };

        let scanId: string | null = null;
        if (userId) {
          scanId = await saveScan(userId, query, brandName, engines, scoreData);
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
