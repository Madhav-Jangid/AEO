import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Scan } from "@/lib/types";
import { Card } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Insights",
};

function buildRecommendations(scans: Scan[]) {
  const latest = scans[0];
  if (!latest?.score_data) return [] as string[];

  const items: string[] = [];
  const mentionRate = latest.score_data.engines.length
    ? (latest.score_data.mentionCount / latest.score_data.engines.length) * 100
    : 0;

  if (mentionRate < 40) items.push("Strengthen product-page clarity for buyer-intent keywords from this query.");
  if ((latest.score_data.sentimentScore ?? 0) < 55) items.push("Add trust signals and concrete proof points to improve response tone.");
  if ((latest.score_data.competitors?.length ?? 0) > 0) items.push("Compare your positioning against top-mentioned competitors and close value gaps.");
  items.push("Re-run this exact query after updates to measure directional change.");

  return items;
}

export default async function RecommendationPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/login");

  const { data: rawScans } = await supabase
    .from("scans")
    .select("id, query, brand_name, score_data, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const scans = ((rawScans || []) as Scan[]).filter((s) => s.score_data);
  const latest = scans[0];
  const recommendations = buildRecommendations(scans);

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5">
      <Card className="border-white/15 bg-gradient-to-br from-[#1f1531] via-[#151a24] to-[#0f1113] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">Recommendation</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Action plan for your next optimization sprint</h1>
        <p className="mt-2 text-sm text-neutral-300">Practical suggestions generated from your most recent diagnostics.</p>
      </Card>

      {!latest ? (
        <Card className="p-8 text-center text-sm text-neutral-300">
          Run a diagnostic first to receive recommendations. <Link href="/dashboard/run" className="text-purple-200 underline">Start here</Link>
        </Card>
      ) : (
        <>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">Based on latest query</p>
            <p className="mt-2 text-lg font-medium text-white">{latest.query}</p>
            <p className="mt-1 text-sm text-neutral-400">Score {Math.round(latest.score_data?.totalScore ?? 0)} | Brand {latest.brand_name}</p>
          </Card>

          <section className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <Card key={rec} className="p-5">
                <p className="text-sm text-neutral-100">{rec}</p>
              </Card>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
