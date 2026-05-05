import type { EngineAnalysis, CompetitorRow, ScoreData, Sentiment, Grade } from "@/lib/types";

// ─── Response parser ──────────────────────────────────────────────────────────

export function analyzeResponse(
  response: string,
  brandName: string
): Pick<EngineAnalysis, "mentioned" | "position" | "sentiment" | "competitors"> {
  const lower = response.toLowerCase();
  const lowerBrand = brandName.toLowerCase().trim();

  const mentioned = lower.includes(lowerBrand);
  let position: number | null = null;
  let sentiment: Sentiment | null = null;
  const competitors: string[] = [];

  if (mentioned) {
    // Find which numbered list item contains the brand
    const lines = response.split("\n");
    let listIndex = 0;
    for (const line of lines) {
      const numMatch = line.match(/^\s*(\d+)[.):\s]/);
      if (numMatch) {
        listIndex++;
        if (line.toLowerCase().includes(lowerBrand)) {
          position = parseInt(numMatch[1]);
          break;
        }
      } else if (line.toLowerCase().includes(lowerBrand) && listIndex > 0) {
        position = listIndex;
        break;
      }
    }

    // Sentiment: keyword scan in ±250 chars around the brand mention
    const idx = lower.indexOf(lowerBrand);
    const ctx = lower.slice(Math.max(0, idx - 120), idx + 250);
    const pos = [
      "best", "excellent", "highly", "recommend", "great", "top", "perfect",
      "outstanding", "superior", "leading", "premium", "popular", "trusted",
      "effective", "favorite", "ideal", "award", "proven",
    ].filter((w) => ctx.includes(w)).length;
    const neg = [
      "avoid", "poor", "bad", "worst", "disappoint", "inferior", "concern",
      "issue", "problem", "limited", "lacking", "controversy", "recall",
    ].filter((w) => ctx.includes(w)).length;
    sentiment = pos > neg ? "positive" : neg > pos ? "negative" : "neutral";
  }

  // Extract numbered list items as competitor candidates
  for (const line of response.split("\n")) {
    const m = line.match(/^\s*\d+[.):\s]+(.+)$/);
    if (!m) continue;
    const raw = m[1].trim().replace(/\*\*/g, "").replace(/\*/g, "");
    // Grab text before any dash/colon separator — that's usually the brand name
    const name = raw.split(/\s*[-–:,]\s*/)[0].trim();
    if (name.toLowerCase() !== lowerBrand && name.length >= 2 && name.length <= 60) {
      competitors.push(name);
    }
  }

  return { mentioned, position, sentiment, competitors: competitors.slice(0, 6) };
}

// ─── Scoring algorithm ────────────────────────────────────────────────────────

export function computeScore(
  engines: EngineAnalysis[]
): Omit<ScoreData, "engines" | "competitors" | "insights"> {
  const total = Math.max(engines.length, 1);
  const mentioned = engines.filter((e) => e.mentioned);
  const mentionCount = mentioned.length;

  // mentionScore scales with how many of the selected engines mentioned the brand
  const mentionScore = Math.round((mentionCount / total) * 40);

  // positionScore = average of position quality per engine where mentioned
  let positionScore = 0;
  if (mentioned.length > 0) {
    const raw = mentioned.map((e) => {
      if (!e.position) return 15; // mentioned but position unclear → middle score
      return Math.max(0, ((10 - Math.min(e.position, 10)) / 10) * 40);
    });
    positionScore = Math.round(raw.reduce((a, b) => a + b, 0) / mentioned.length);
  }

  // sentimentScore = positive=20, neutral=10, negative=0, averaged
  let sentimentScore = 0;
  if (mentioned.length > 0) {
    const raw = mentioned.map((e) =>
      e.sentiment === "positive" ? 20 : e.sentiment === "neutral" ? 10 : 0
    );
    const sum = raw.reduce((a, b) => a + b, 0 as number);
    sentimentScore = sum
  }

  const totalScore = Math.min(100, mentionScore + positionScore + sentimentScore);
  const grade: Grade =
    totalScore >= 80
      ? "A"
      : totalScore >= 60
        ? "B"
        : totalScore >= 40
          ? "C"
          : totalScore >= 20
            ? "D"
            : "F";

  return { totalScore, grade, mentionScore, positionScore, sentimentScore, mentionCount };
}

// ─── Competitor aggregation (engine-agnostic) ─────────────────────────────────

export function extractCompetitors(
  engines: EngineAnalysis[],
  brandName: string
): CompetitorRow[] {
  const lowerBrand = brandName.toLowerCase().trim();
  const map = new Map<
    string,
    { name: string; mentionedBy: Record<string, boolean>; positions: number[] }
  >();

  for (const engine of engines) {
    engine.competitors.forEach((name, i) => {
      const key = name.toLowerCase().trim();
      if (key === lowerBrand || key.length < 2) return;
      if (!map.has(key)) map.set(key, { name, mentionedBy: {}, positions: [] });
      const row = map.get(key)!;
      row.mentionedBy[engine.engine] = true;
      row.positions.push(i + 1);
    });
  }

  return Array.from(map.values())
    .map((d) => {
      const timesMentioned = Object.values(d.mentionedBy).filter(Boolean).length;
      return {
        brand: d.name,
        mentionedBy: d.mentionedBy,
        timesMentioned,
        avgPosition: d.positions.length
          ? Math.round(d.positions.reduce((a, b) => a + b, 0) / d.positions.length)
          : null,
        // Legacy field aliases so old report pages still work
        mentionedByGpt: d.mentionedBy["gpt"] ?? false,
        mentionedByClaude: d.mentionedBy["claude"] ?? false,
        mentionedByGemini: d.mentionedBy["gemini"] ?? false,
      };
    })
    .filter((r) => r.timesMentioned > 0)
    .sort((a, b) => b.timesMentioned - a.timesMentioned)
    .slice(0, 10);
}
