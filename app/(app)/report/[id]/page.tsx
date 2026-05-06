import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getEngineMeta } from "@/lib/config/models";
import type { Scan, CompetitorRow } from "@/lib/types";
import { Card } from "@/components/ui/primitives";
import { InsightsSection } from "./InsightsSection";
import { PrintButton } from "./PrintButton";

export const metadata: Metadata = {
  title: "Report",
};

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) redirect("/login");

  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (error || !scan) {
    return <div className="p-10 text-sm text-neutral-300">Report not found.</div>;
  }

  const typedScan = scan as Scan;
  if (!typedScan.score_data) {
    return <div className="p-10 text-sm text-neutral-300">No score data available.</div>;
  }

  const { score_data, query, brand_name, created_at } = typedScan;
  const { totalScore, grade, mentionCount, engines, competitors } = score_data;

  const scoreTone = totalScore >= 70 ? "text-emerald-300" : totalScore >= 40 ? "text-amber-300" : "text-red-300";

  function isMentionedBy(comp: CompetitorRow, engineId: string): boolean {
    if (comp.mentionedBy) return comp.mentionedBy[engineId] ?? false;
    if (engineId === "gpt") return comp.mentionedByGpt ?? false;
    if (engineId === "claude") return comp.mentionedByClaude ?? false;
    if (engineId === "gemini") return comp.mentionedByGemini ?? false;
    return false;
  }

  const engineIds = engines.map((e) => e.engine);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5 pb-12" style={{ fontFamily: "var(--font-outfit)" }}>
      <Card className="border-white/15 bg-gradient-to-br from-[#1f1531] via-[#151a24] to-[#0f1113] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/dashboard/history" className="mb-3 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-neutral-200 transition hover:bg-white/10">
              Back to history
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">Report</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Diagnostic report</h1>
            <p className="mt-2 text-sm text-neutral-300">
              Query: <span className="text-white">&ldquo;{query}&rdquo;</span> | Brand: <span className="text-purple-200">{brand_name}</span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">{new Date(created_at).toLocaleString()}</p>
          </div>
          <div className="no-print">
            <PrintButton />
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 md:col-span-1">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Total score</p>
          <p className={`mt-2 text-4xl font-semibold ${scoreTone}`}>{totalScore}</p>
          <p className="mt-1 text-xs text-neutral-400">Grade {grade}</p>
        </Card>
        <Card className="p-4 md:col-span-1">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Mentions</p>
          <p className="mt-2 text-3xl font-semibold text-white">{mentionCount}/{engines.length}</p>
          <p className="mt-1 text-xs text-neutral-400">Models where your brand appears</p>
        </Card>
        <Card className="p-4 md:col-span-1">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Mention score</p>
          <p className="mt-2 text-3xl font-semibold text-white">{score_data.mentionScore}</p>
          <p className="mt-1 text-xs text-neutral-400">Weighted ranking signal</p>
        </Card>
        <Card className="p-4 md:col-span-1">
          <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Sentiment score</p>
          <p className="mt-2 text-3xl font-semibold text-white">{score_data.sentimentScore}</p>
          <p className="mt-1 text-xs text-neutral-400">Overall response tone</p>
        </Card>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Model breakdown</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {engines.map((engine) => {
            const meta = getEngineMeta(engine.engine);
            return (
              <Card key={engine.engine} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    <p className="text-sm font-semibold" style={{ color: meta.color }}>{meta.name}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${engine.mentioned ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                    {engine.mentioned ? "Mentioned" : "Not mentioned"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <p className="text-xs text-neutral-500">Position</p>
                    <p className="mt-1 text-neutral-200">{engine.position ? `#${engine.position}` : "-"}</p>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-3">
                    <p className="text-xs text-neutral-500">Sentiment</p>
                    <p className="mt-1 capitalize text-neutral-200">{engine.sentiment ?? "neutral"}</p>
                  </div>
                </div>

                {engine.competitors?.length ? (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-neutral-500">Top competitors</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {engine.competitors.slice(0, 4).map((c) => (
                        <span key={c} className="rounded-full bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-300">{c}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-neutral-400">View full response</summary>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">{engine.response}</p>
                </details>
              </Card>
            );
          })}
        </div>
      </section>

      {competitors?.length ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Competitor comparison</h2>
          <Card className="overflow-x-auto p-0">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.12em]">Brand</th>
                  {engineIds.map((eid) => (
                    <th key={eid} className="px-4 py-3 text-center text-xs uppercase tracking-[0.12em]">{getEngineMeta(eid).name}</th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs uppercase tracking-[0.12em]">Mentions</th>
                  <th className="px-4 py-3 text-center text-xs uppercase tracking-[0.12em]">Avg Pos</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp) => (
                  <tr key={comp.brand} className="border-b border-white/5">
                    <td className="px-4 py-3 text-neutral-100">{comp.brand}</td>
                    {engineIds.map((eid) => (
                      <td key={`${comp.brand}-${eid}`} className="px-4 py-3 text-center text-neutral-300">{isMentionedBy(comp, eid) ? "Yes" : "No"}</td>
                    ))}
                    <td className="px-4 py-3 text-center text-neutral-100">{comp.timesMentioned}</td>
                    <td className="px-4 py-3 text-center text-neutral-300">{comp.avgPosition ? `#${comp.avgPosition}` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Recommendations</h2>
        <InsightsSection scan={typedScan} />
      </section>
    </div>
  );
}
