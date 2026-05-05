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
  const scansWithData = scans.filter((scan) => scan.score_data);

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
    latestScore !== null && previousScore !== null ? Math.abs(latestScore - previousScore) : null;

  const latestMentionCount = latestScan?.score_data?.mentionCount ?? 0;

  const visibilityRate =
    scansWithData.length > 0
      ? Math.round(
          (scansWithData.reduce((acc, scan) => acc + (scan.score_data?.mentionCount ?? 0), 0) /
            (scansWithData.length * 3)) *
            100,
        )
      : null;

  const allPositions: number[] = [];
  scansWithData.forEach((scan) => {
    scan.score_data?.engines?.forEach((engine) => {
      if (engine.position !== null && engine.position !== undefined) {
        allPositions.push(engine.position);
      }
    });
  });

  const avgRank =
    allPositions.length > 0
      ? Math.round(allPositions.reduce((acc, value) => acc + value, 0) / allPositions.length)
      : null;

  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  scansWithData.forEach((scan) => {
    scan.score_data?.engines?.forEach((engine) => {
      if (engine.sentiment) {
        sentimentCounts[engine.sentiment]++;
      }
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

  const competitorFreq: Record<string, number> = {};
  scansWithData.forEach((scan) => {
    scan.score_data?.competitors?.forEach((competitor) => {
      competitorFreq[competitor.brand] = (competitorFreq[competitor.brand] ?? 0) + competitor.timesMentioned;
    });
  });

  const topCompetitors = Object.entries(competitorFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  const recentScans = scansWithData.slice(0, 6);
  const hasData = scansWithData.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#221536] via-[#181623] to-[#101112] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-purple-300/80">Overview</p>
            <h1 className="text-2xl font-semibold leading-tight text-white md:text-3xl">Track how AI sees your brand</h1>
            <p className="text-sm text-neutral-300 md:text-base">
              Get a clean snapshot of visibility, ranking movement, and competitor pressure across your latest scans.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard/history"
              className="rounded-xl border border-purple-300/30 px-4 py-2 text-sm text-purple-100 transition hover:bg-purple-400/10"
            >
              View History
            </Link>
            <Link
              href="/dashboard/run"
              className="rounded-xl bg-[#914bf1] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              Run Diagnostic
            </Link>
          </div>
        </div>
      </section>

      {!hasData ? (
        <section className="rounded-3xl border border-white/10 bg-[#151719] p-8 text-center md:p-12">
          <p className="text-xl font-medium text-white">No scans yet</p>
          <p className="mt-2 text-sm text-neutral-400">Run your first diagnostic to start tracking AI visibility performance.</p>
          <Link
            href="/dashboard/run"
            className="mt-6 inline-flex rounded-xl bg-[#914bf1] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Start First Scan
          </Link>
        </section>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="AEO Score"
              value={latestScore !== null ? String(latestScore) : "--"}
              hint={
                scoreDiff !== null
                  ? `${scoreTrend === "up" ? "Up" : scoreTrend === "down" ? "Down" : "No change"} ${scoreDiff} vs previous`
                  : "Needs at least two scans"
              }
            />
            <StatCard label="Visibility" value={visibilityRate !== null ? `${visibilityRate}%` : "--"} hint="Mentions across engines" />
            <StatCard label="Average Rank" value={avgRank !== null ? `#${avgRank}` : "--"} hint="Lower is better" />
            <StatCard label="Sentiment" value={overallSentiment ?? "--"} hint="Dominant AI tone" />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-[#151719] p-5 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-neutral-400">Latest Query</p>
                {latestScan?.id && (
                  <Link href={`/report/${latestScan.id}`} className="text-sm text-purple-300 underline underline-offset-4">
                    Open report
                  </Link>
                )}
              </div>

              <p className="text-base text-white md:text-lg">{latestScan?.query ?? "No query found"}</p>
              <p className="mt-3 text-sm text-neutral-400">
                {latestMentionCount > 0 ? `Visible in ${latestMentionCount}/3 engines` : "Not visible in monitored engines"}
              </p>
            </article>

            <article className="rounded-2xl border border-white/10 bg-[#151719] p-5">
              <p className="mb-4 text-sm text-neutral-400">Top Competitors</p>

              {topCompetitors.length === 0 ? (
                <p className="text-sm text-neutral-500">No competitor mentions yet.</p>
              ) : (
                <div className="space-y-3">
                  {topCompetitors.map((competitor) => (
                    <div key={competitor.brand} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-200">{competitor.brand}</span>
                      <span className="rounded-md border border-white/10 px-2 py-0.5 text-neutral-400">{competitor.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#151719] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-neutral-400">Recent Scans</p>
              <Link href="/dashboard/history" className="text-sm text-purple-300 underline underline-offset-4">
                See all
              </Link>
            </div>

            <div className="space-y-2">
              {recentScans.map((scan) => {
                const score = Math.round(scan.score_data?.totalScore ?? 0);

                return (
                  <Link
                    key={scan.id}
                    href={`/report/${scan.id}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3 transition hover:bg-white/10"
                  >
                    <span className="max-w-[75%] truncate text-sm text-neutral-200">{scan.query}</span>
                    <span className="text-sm font-medium text-white">{score}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#151719] p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs text-neutral-400">{hint}</p>
    </article>
  );
}

