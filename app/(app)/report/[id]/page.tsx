import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEngineMeta } from "@/lib/config/models";
import type { Scan, CompetitorRow } from "@/lib/types";
import { InsightsSection } from "./InsightsSection";
import { PrintButton } from "./PrintButton";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (error || !scan) {
    return <div style={{ color: "rgb(255,255,255)", padding: "40px" }}>Report not found.</div>;
  }

  const typedScan = scan as Scan;
  if (!typedScan.score_data) {
    return <div style={{ color: "rgb(255,255,255)", padding: "40px" }}>No score data available.</div>;
  }

  const { score_data, query, brand_name, created_at } = typedScan;
  const { totalScore, grade, mentionCount, engines, competitors } = score_data;

  // Grade color
  const gradeColors: Record<string, string> = {
    A: "text-emerald-400",
    B: "text-blue-400",
    C: "text-yellow-400",
    D: "text-amber-400",
    F: "text-red-400",
  };
  const gradeBorder: Record<string, string> = {
    A: "border-emerald-400 bg-emerald-400/10",
    B: "border-blue-400 bg-blue-400/10",
    C: "border-yellow-400 bg-yellow-400/10",
    D: "border-amber-400 bg-amber-400/10",
    F: "border-red-400 bg-red-400/10",
  };
  const gradeClass = `${gradeColors[grade] ?? "text-slate-400"} ${gradeBorder[grade] ?? "border-slate-400 bg-slate-400/10"}`;

  // Competitor helper â€” resolves both new (mentionedBy) and legacy field formats
  function isMentionedBy(comp: CompetitorRow, engineId: string): boolean {
    if (comp.mentionedBy) return comp.mentionedBy[engineId] ?? false;
    if (engineId === "gpt") return comp.mentionedByGpt ?? false;
    if (engineId === "claude") return comp.mentionedByClaude ?? false;
    if (engineId === "gemini") return comp.mentionedByGemini ?? false;
    return false;
  }

  const engineIds = engines.map((e) => e.engine);

  return (
    <div className="space-y-8 pb-12" style={{ fontFamily: "var(--font-outfit)" }}>
      {/* â”€â”€ A. Header â”€â”€ */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-[#221536] via-[#181623] to-[#101112] p-6">
        <div>
          <h1 className="text-xl font-medium" style={{ color: "rgb(217,217,217)" }}>
            Diagnostic Report:{" "}
            <span className="font-bold" style={{ color: "rgb(255,255,255)" }}>
              &ldquo;{query}&rdquo;
            </span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgb(107,114,128)" }}>
            Brand: <span style={{ color: "rgb(192,132,252)" }}>{brand_name}</span>
            &nbsp;&bull;&nbsp;
            {new Date(created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3 no-print">
          <PrintButton />
        </div>
      </header>

      {/* â”€â”€ B. Overall Score â”€â”€ */}
      <section
        className="flex flex-col md:flex-row items-center gap-8 p-6 sm:p-8"
        style={{ backgroundColor: "rgb(21,23,25)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div
          className={`flex items-center justify-center w-32 h-32 rounded-full border-4 ${gradeClass}`}
          style={{ flexShrink: 0 }}
        >
          <div className="text-center">
            <span className="block text-4xl font-black">{totalScore}</span>
            <span className="block text-xs font-bold uppercase tracking-widest">Grade {grade}</span>
          </div>
        </div>
        <div className="flex-1 space-y-3 text-center md:text-left">
          <h2 className="text-2xl font-bold" style={{ color: "rgb(255,255,255)" }}>
            Overall AEO Score
          </h2>
          <p className="text-sm" style={{ color: "rgb(217,217,217)" }}>
            Composite score based on mention rate, position, and sentiment across{" "}
            {engines.length} AI model{engines.length !== 1 ? "s" : ""}.
          </p>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: "rgba(145,75,241,0.12)", border: "1px solid rgba(145,75,241,0.35)" }}
          >
            <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: "rgb(145,75,241)" }} />
            <span style={{ color: "rgb(217,217,217)" }}>
              Your brand was mentioned in{" "}
              <strong style={{ color: "rgb(255,255,255)" }}>{mentionCount}/{engines.length}</strong>{" "}
              AI model{engines.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* â”€â”€ C. Per-Engine Breakdown â”€â”€ */}
      <section>
        <h3 className="text-xl font-bold mb-4" style={{ color: "rgb(255,255,255)" }}>
          Per-Model Breakdown
        </h3>
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))` }}
        >
          {engines.map((engine) => {
            const { name: engineName, color: engineColor } = getEngineMeta(engine.engine);

            return (
              <div
                key={engine.engine}
                className="flex flex-col overflow-hidden"
                style={{
                  backgroundColor: "rgb(21,23,25)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)",
                  // border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* Card header */}
                <div className="p-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: engineColor }}
                    />
                    <h4 className="text-base font-bold" style={{ color: engineColor }}>
                      {engineName}
                    </h4>
                    {engine.isFallback && (
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: "rgba(251,191,36,0.15)",
                          color: "rgb(251,191,36)",
                        }}
                      >
                        fallback
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 space-y-4">
                  {/* Mentioned */}
                  <div
                    className="flex justify-between items-center p-3 rounded-xl"
                    style={{ backgroundColor: "rgb(16,17,18)" }}
                  >
                    <span className="text-sm" style={{ color: "rgb(156,163,175)" }}>
                      Mentioned?
                    </span>
                    {engine.mentioned ? (
                      <span
                        className="px-2 py-0.5 text-xs font-bold rounded"
                        style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "rgb(34,197,94)" }}
                      >
                        YES
                      </span>
                    ) : (
                      <span
                        className="px-2 py-0.5 text-xs font-bold rounded"
                        style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "rgb(239,68,68)" }}
                      >
                        NO
                      </span>
                    )}
                  </div>

                  {engine.mentioned && (
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: "rgb(16,17,18)" }}
                      >
                        <span className="block text-xs mb-1" style={{ color: "rgb(156,163,175)" }}>
                          Position
                        </span>
                        <span className="text-sm font-bold" style={{ color: "rgb(255,255,255)" }}>
                          {engine.position ? `#${engine.position}` : "â€”"}
                        </span>
                      </div>
                      <div
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: "rgb(16,17,18)" }}
                      >
                        <span className="block text-xs mb-1" style={{ color: "rgb(156,163,175)" }}>
                          Sentiment
                        </span>
                        <span
                          className="text-sm font-bold capitalize"
                          style={{
                            color:
                              engine.sentiment === "positive"
                                ? "rgb(34,197,94)"
                                : engine.sentiment === "negative"
                                  ? "rgb(239,68,68)"
                                  : "rgb(217,217,217)",
                          }}
                        >
                          {engine.sentiment ?? "Neutral"}
                        </span>
                      </div>
                    </div>
                  )}

                  {engine.competitors && engine.competitors.length > 0 && (
                    <div>
                      <span
                        className="text-xs uppercase tracking-wider font-semibold"
                        style={{ color: "rgb(107,114,128)" }}
                      >
                        Top Competitors
                      </span>
                      <ul className="mt-2 space-y-1">
                        {engine.competitors.slice(0, 3).map((comp, idx) => (
                          <li
                            key={idx}
                            className="text-sm flex items-center gap-2"
                            style={{ color: "rgb(217,217,217)" }}
                          >
                            <span className="text-xs" style={{ color: "rgb(107,114,128)" }}>
                              {idx + 1}.
                            </span>
                            {comp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Collapsible response */}
                <details
                  className="group"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <summary
                    className="p-3 text-xs text-center font-medium cursor-pointer list-none hover:opacity-80 transition-opacity"
                    style={{ color: "rgb(107,114,128)" }}
                  >
                    View Full Response
                  </summary>
                  <div
                    className="p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono max-h-60 overflow-y-auto"
                    style={{
                      color: "rgb(156,163,175)",
                      backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                  >
                    {engine.response}
                  </div>
                </details>
              </div>
            );
          })}
        </div>
      </section>

      {/* â”€â”€ D. Competitor Intelligence â”€â”€ */}
      {competitors && competitors.length > 0 && (
        <section>
          <h3 className="text-xl font-bold mb-4" style={{ color: "rgb(255,255,255)" }}>
            Competitor Intelligence
          </h3>
          <div
            className="overflow-hidden"
            style={{ backgroundColor: "rgb(21,23,25)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <th
                      className="text-left px-6 py-4 text-xs uppercase tracking-wider font-semibold"
                      style={{ color: "rgb(107,114,128)" }}
                    >
                      Brand / Product
                    </th>
                    {engineIds.map((eid) => {
                      const { name, color } = getEngineMeta(eid);
                      return (
                        <th
                          key={eid}
                          className="px-6 py-4 text-center text-xs uppercase tracking-wider font-semibold"
                          style={{ color }}
                        >
                          {name}
                        </th>
                      );
                    })}
                    <th
                      className="px-6 py-4 text-center text-xs uppercase tracking-wider font-semibold"
                      style={{ color: "rgb(107,114,128)" }}
                    >
                      Mentions
                    </th>
                    <th
                      className="px-6 py-4 text-center text-xs uppercase tracking-wider font-semibold"
                      style={{ color: "rgb(107,114,128)" }}
                    >
                      Avg Pos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((comp, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td
                        className="px-6 py-4 font-medium"
                        style={{ color: "rgb(255,255,255)" }}
                      >
                        {comp.brand}
                      </td>
                      {engineIds.map((eid) => (
                        <td key={eid} className="px-6 py-4 text-center text-base">
                          {isMentionedBy(comp, eid) ? "✅" : "❌"}
                        </td>
                      ))}
                      <td
                        className="px-6 py-4 text-center font-bold"
                        style={{ color: "rgb(145,75,241)" }}
                      >
                        {comp.timesMentioned}
                      </td>
                      <td
                        className="px-6 py-4 text-center"
                        style={{ color: "rgb(217,217,217)" }}
                      >
                        {comp.avgPosition ? `#${comp.avgPosition}` : "â€”"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* â”€â”€ E. Actionable Insights â”€â”€ */}
      <section>
        <h3 className="text-xl font-bold mb-4" style={{ color: "rgb(255,255,255)" }}>
          Actionable Recommendations
        </h3>
        <InsightsSection scan={typedScan} />
      </section>
    </div>
  );
}


