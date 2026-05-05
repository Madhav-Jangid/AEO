import type { Scan } from "@/lib/types";

interface InsightsSectionProps {
  scan: Scan;
}

export function InsightsSection({ scan }: InsightsSectionProps) {
  if (!scan.score_data) return null;

  const { insights = [] } = scan.score_data;

  if (!insights || insights.length === 0) {
    return (
      <div
        className="p-6 rounded-2xl text-center"
        style={{ backgroundColor: "rgb(39,40,41)" }}
      >
        <p className="text-sm" style={{ color: "rgb(156,163,175)" }}>
          No insights available for this scan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => (
        <div
          key={idx}
          className="p-4 rounded-2xl border-l-4"
          style={{
            backgroundColor: "rgb(39,40,41)",
            borderLeftColor: "rgb(145,75,241)",
          }}
        >
          <h3 className="font-semibold text-sm" style={{ color: "rgb(255,255,255)" }}>
            {insight.title}
          </h3>
          <p className="mt-1 text-sm" style={{ color: "rgb(217,217,217)" }}>
            {insight.description}
          </p>
        </div>
      ))}
    </div>
  );
}
