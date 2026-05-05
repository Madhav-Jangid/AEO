import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResponse, computeScore, extractCompetitors } from "@/lib/scoring";
import { callModel } from "@/lib/ai/provider";
import { saveScan } from "@/lib/data";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const { query, brandName, selectedModels } = (await req.json()) as {
      query?: string;
      brandName?: string;
      selectedModels?: string[];
    };

    if (!query?.trim() || !brandName?.trim()) {
      return NextResponse.json({ error: "query and brandName are required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const defaultIds = AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id);
    const modelsToRun = selectedModels?.length ? selectedModels : defaultIds;

    if (modelsToRun.length === 0) {
      return NextResponse.json({ error: "At least one model must be selected" }, { status: 400 });
    }

    const results = await Promise.allSettled(modelsToRun.map((id) => callModel(id, query)));

    const engines: EngineAnalysis[] = results.map((result, i) => ({
      engine: modelsToRun[i],
      response: result.status === "fulfilled" ? result.value : "",
      isFallback: result.status === "rejected",
      ...(result.status === "fulfilled"
        ? analyzeResponse(result.value, brandName)
        : { mentioned: false, position: null, sentiment: null, competitors: [] }),
    }));

    const scores = computeScore(engines);
    const competitors = extractCompetitors(engines, brandName);
    const scoreData: ScoreData = { ...scores, engines, competitors };
    const scanId = await saveScan(userData.user.id, query, brandName, engines, scoreData);

    return NextResponse.json({ scanId, query, brandName, scoreData });
  } catch (err) {
    console.error("scan error:", err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
