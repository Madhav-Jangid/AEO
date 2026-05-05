import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Scan } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const { data: rawScans } = await supabase
    .from("scans")
    .select("id, query, brand_name, score_data, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const scans = (rawScans || []) as Scan[];
  const scansWithData = scans.filter((s) => s.score_data);

  const latestScan = scansWithData[0] ?? null;
  const previousScan = scansWithData[1] ?? null;

  const latestScore = latestScan ? Math.round(latestScan.score_data!.totalScore) : null;
  const previousScore = previousScan ? Math.round(previousScan.score_data!.totalScore) : null;
  const scoreTrend =
    latestScore !== null && previousScore !== null
      ? latestScore > previousScore
        ? "up"
        : latestScore < previousScore
        ? "down"
        : "neutral"
      : "neutral";
  const scoreDiff =
    latestScore !== null && previousScore !== null
      ? Math.abs(latestScore - previousScore)
      : null;

  const latestMentionCount = latestScan?.score_data?.mentionCount ?? 0;

  // Visibility rate across all scans
  const visibilityRate =
    scansWithData.length > 0
      ? Math.round(
          (scansWithData.reduce((acc, s) => acc + (s.score_data?.mentionCount ?? 0), 0) /
            (scansWithData.length * 3)) *
            100
        )
      : null;

  // Average rank from non-null engine positions
  const allPositions: number[] = [];
  scansWithData.forEach((s) => {
    s.score_data?.engines?.forEach((e) => {
      if (e.position !== null && e.position !== undefined) allPositions.push(e.position);
    });
  });
  const avgRank =
    allPositions.length > 0
      ? Math.round(allPositions.reduce((a, b) => a + b, 0) / allPositions.length)
      : null;

  // Dominant sentiment
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  scansWithData.forEach((s) => {
    s.score_data?.engines?.forEach((e) => {
      if (e.sentiment) sentimentCounts[e.sentiment]++;
    });
  });
  const maxSentiment = Math.max(...Object.values(sentimentCounts));
  const overallSentiment =
    maxSentiment === 0
      ? null
      : sentimentCounts.positive === maxSentiment
      ? "Positive"
      : sentimentCounts.negative === maxSentiment
      ? "Negative"
      : "Neutral";

  // Top competitors across all scans
  const competitorFreq: Record<string, number> = {};
  scansWithData.forEach((scan) => {
    scan.score_data?.competitors?.forEach((comp) => {
      competitorFreq[comp.brand] = (competitorFreq[comp.brand] ?? 0) + comp.timesMentioned;
    });
  });
  const topCompetitors = Object.entries(competitorFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  const recentScans = scansWithData.slice(0, 5);
  const hasData = scansWithData.length > 0;

  const scoreBarColor =
    (latestScore ?? 0) >= 70
      ? "rgb(34,197,94)"
      : (latestScore ?? 0) >= 40
      ? "rgb(251,191,36)"
      : "rgb(239,68,68)";

  return (
    <div style={{ fontFamily: "var(--font-outfit)" }} className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "rgb(255,255,255)" }}>
            AI Visibility Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgb(217,217,217)" }}>
            Your AI visibility health at a glance
          </p>
        </div>
        <Link
          href="/dashboard/run"
          className="inline-flex items-center gap-2 font-medium transition-all hover:opacity-90 shrink-0"
          style={{
            backgroundColor: "rgb(145,75,241)",
            color: "rgb(255,255,255)",
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            textDecoration: "none",
          }}
        >
          Run New Diagnostic
        </Link>
      </div>

      {!hasData ? (
        /* ── Empty State ── */
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: "rgba(145,75,241,0.15)" }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgb(145,75,241)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "rgb(255,255,255)" }}>
            Run your first diagnostic
          </h2>
          <p className="text-base mb-8 max-w-md" style={{ color: "rgb(217,217,217)" }}>
            See how GPT-4o, Claude, and Gemini respond to queries about your product — and whether
            they recommend you.
          </p>
          <Link
            href="/dashboard/run"
            className="inline-flex items-center gap-2 font-semibold transition-all hover:opacity-90"
            style={{
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              padding: "12px 28px",
              borderRadius: "8px",
              fontSize: "15px",
              textDecoration: "none",
            }}
          >
            Run New Diagnostic →
          </Link>
        </div>
      ) : (
        <>
          {/* ── Row 1: AEO Score + Latest Query Snapshot ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* AEO Score */}
            <div className="p-6" style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}>
              <p className="text-sm font-medium mb-4" style={{ color: "rgb(217,217,217)" }}>
                AEO Score
              </p>
              <div className="flex items-end gap-4 mb-4">
                <span className="text-6xl font-black" style={{ color: "rgb(255,255,255)" }}>
                  {latestScore ?? "--"}
                </span>
                {scoreDiff !== null && (
                  <div
                    className="flex items-center gap-1 mb-2"
                    style={{
                      color:
                        scoreTrend === "up"
                          ? "rgb(34,197,94)"
                          : scoreTrend === "down"
                          ? "rgb(239,68,68)"
                          : "rgb(156,163,175)",
                    }}
                  >
                    <span className="text-xl font-bold">
                      {scoreTrend === "up" ? "↑" : scoreTrend === "down" ? "↓" : "→"}
                    </span>
                    <span className="text-sm font-medium">
                      {scoreTrend !== "neutral" ? `${scoreDiff} from last run` : "No change"}
                    </span>
                  </div>
                )}
              </div>
              {/* Progress bar */}
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${latestScore ?? 0}%`, backgroundColor: scoreBarColor }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs" style={{ color: "rgb(156,163,175)" }}>
                  0
                </span>
                <span className="text-xs" style={{ color: "rgb(156,163,175)" }}>
                  100
                </span>
              </div>
            </div>

            {/* Latest Query Snapshot */}
            <div className="p-6" style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}>
              <p className="text-sm font-medium mb-4" style={{ color: "rgb(217,217,217)" }}>
                Latest Query Snapshot
              </p>
              {latestScan ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: "rgb(156,163,175)" }}>
                      Query
                    </p>
                    <p className="font-medium" style={{ color: "rgb(255,255,255)" }}>
                      &ldquo;{latestScan.query}&rdquo;
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-2" style={{ color: "rgb(156,163,175)" }}>
                      Visibility
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        style={{ color: latestMentionCount > 0 ? "rgb(34,197,94)" : "rgb(239,68,68)" }}
                      >
                        {latestMentionCount > 0 ? "✅" : "❌"}
                      </span>
                      <span className="font-medium text-sm" style={{ color: "rgb(255,255,255)" }}>
                        {latestMentionCount > 0
                          ? `Found in ${latestMentionCount}/3 AIs`
                          : "Not found in any AI"}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/report/${latestScan.id}`}
                    className="inline-block text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ color: "rgb(145,75,241)", textDecoration: "none" }}
                  >
                    View Full Report →
                  </Link>
                </div>
              ) : (
                <p style={{ color: "rgb(217,217,217)" }}>No scans yet</p>
              )}
            </div>
          </div>

          {/* ── Row 2: Quick Stats ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="p-5 text-center"
              style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "16px" }}
            >
              <p
                className="text-4xl font-black mb-1"
                style={{ color: "rgb(145,75,241)" }}
              >
                {visibilityRate !== null ? `${visibilityRate}%` : "--"}
              </p>
              <p className="text-sm" style={{ color: "rgb(217,217,217)" }}>
                Visibility Rate
              </p>
            </div>
            <div
              className="p-5 text-center"
              style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "16px" }}
            >
              <p
                className="text-4xl font-black mb-1"
                style={{ color: "rgb(251,191,36)" }}
              >
                {avgRank !== null ? `#${avgRank}` : "--"}
              </p>
              <p className="text-sm" style={{ color: "rgb(217,217,217)" }}>
                Avg Rank
              </p>
            </div>
            <div
              className="p-5 text-center"
              style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "16px" }}
            >
              <p
                className="text-4xl font-black mb-1"
                style={{
                  color:
                    overallSentiment === "Positive"
                      ? "rgb(34,197,94)"
                      : overallSentiment === "Negative"
                      ? "rgb(239,68,68)"
                      : "rgb(217,217,217)",
                }}
              >
                {overallSentiment ?? "--"}
              </p>
              <p className="text-sm" style={{ color: "rgb(217,217,217)" }}>
                Sentiment
              </p>
            </div>
          </div>

          {/* ── Row 3: Top Competitors + Recent Scans ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Competitors */}
            <div className="p-6" style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}>
              <h3 className="font-semibold mb-5" style={{ color: "rgb(255,255,255)" }}>
                Top Competitors
              </h3>
              {topCompetitors.length > 0 ? (
                <div className="space-y-3">
                  {topCompetitors.map((comp, i) => (
                    <div key={comp.brand} className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: "rgba(145,75,241,0.15)",
                          color: "rgb(145,75,241)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        className="flex-1 text-sm font-medium"
                        style={{ color: "rgb(255,255,255)" }}
                      >
                        {comp.brand}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ width: "60px", backgroundColor: "rgba(255,255,255,0.08)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(
                                ((comp.count / (topCompetitors[0]?.count || 1)) * 100),
                                100
                              )}%`,
                              backgroundColor: "rgb(145,75,241)",
                            }}
                          />
                        </div>
                        <span className="text-xs" style={{ color: "rgb(156,163,175)" }}>
                          {comp.count}x
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm" style={{ color: "rgb(156,163,175)" }}>
                  No competitor data yet. Run a diagnostic to see which brands appear alongside yours.
                </p>
              )}
            </div>

            {/* Recent Scans */}
            <div className="p-6" style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold" style={{ color: "rgb(255,255,255)" }}>
                  Recent Scans
                </h3>
                <Link
                  href="/dashboard/history"
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "rgb(145,75,241)", textDecoration: "none" }}
                >
                  View all →
                </Link>
              </div>
              <div className="space-y-2">
                {recentScans.map((scan) => {
                  const score = Math.round(scan.score_data?.totalScore ?? 0);
                  const scoreColor =
                    score >= 70
                      ? "rgb(34,197,94)"
                      : score >= 40
                      ? "rgb(251,191,36)"
                      : "rgb(239,68,68)";
                  return (
                    <Link
                      key={scan.id}
                      href={`/report/${scan.id}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "rgb(16,17,18)", textDecoration: "none" }}
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "rgb(255,255,255)" }}
                        >
                          &ldquo;{scan.query}&rdquo;
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "rgb(156,163,175)" }}>
                          {new Date(scan.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className="text-sm font-bold ml-3 shrink-0"
                        style={{ color: scoreColor }}
                      >
                        {score}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div
            className="p-8 text-center"
            style={{
              backgroundColor: "rgb(39,40,41)",
              borderRadius: "20px",
              border: "1px solid rgba(145,75,241,0.25)",
            }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: "rgb(255,255,255)" }}>
              Ready to check your latest AI visibility?
            </h3>
            <p className="text-sm mb-6" style={{ color: "rgb(217,217,217)" }}>
              Run a new diagnostic to see how AI models currently perceive your product.
            </p>
            <Link
              href="/dashboard/run"
              className="inline-flex items-center gap-2 font-semibold transition-all hover:opacity-90"
              style={{
                backgroundColor: "rgb(145,75,241)",
                color: "rgb(255,255,255)",
                padding: "12px 32px",
                borderRadius: "8px",
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              Run New Diagnostic →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
