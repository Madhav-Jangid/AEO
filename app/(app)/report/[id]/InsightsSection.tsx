import type { Scan } from "@/lib/types";
import { Card } from "@/components/ui/primitives";

interface InsightsSectionProps {
  scan: Scan;
}

export function InsightsSection({ scan }: InsightsSectionProps) {
  if (!scan.score_data) return null;

  const { insights = [] } = scan.score_data;

  if (!insights.length) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-neutral-400">No recommendations available for this scan yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((insight, idx) => (
        <Card key={`${insight.title}-${idx}`} className="p-4">
          <h3 className="text-sm font-semibold text-white">{insight.title}</h3>
          <p className="mt-1 text-sm text-neutral-300">{insight.description}</p>
        </Card>
      ))}
    </div>
  );
}
