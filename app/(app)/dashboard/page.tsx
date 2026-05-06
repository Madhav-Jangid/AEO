import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Scan } from "@/lib/types";
import { Card, EmptyState } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) redirect("/login");

  const { data: rawScans } = await supabase
    .from("scans")
    .select("id, query, brand_name, score_data, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const scans = (rawScans || []) as Scan[];
  const scansWithData = scans.filter((scan) => scan.score_data);

  if (scansWithData.length === 0) {
    return (
      <div className="mx-auto w-full max-w-275">
        <EmptyState
          title="No diagnostics yet"
          description="Run your first diagnostic to create your visibility baseline."
          action={<Link href="/dashboard/run" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">Run diagnostic</Link>}
        />
      </div>
    );
  }

  const latest = scansWithData[0];
  const avgScore = Math.round(scansWithData.reduce((sum, s) => sum + (s.score_data?.totalScore ?? 0), 0) / scansWithData.length);

  return (
    <div className="mx-auto w-full max-w-275 space-y-5">
      <Card className="border-white/15 bg-linear-to-br from-[#1f1531] via-[#151a24] to-[#0f1113] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">Overview</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Visibility health at a glance</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">A clean snapshot of current score, mention patterns, and recent runs.</p>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Average score" value={`${avgScore}`} hint="Across recent diagnostics" />
        <Metric label="Latest mentions" value={`${latest.score_data?.mentionCount ?? 0}/${latest.score_data?.engines.length ?? 0}`} hint="From the latest run" />
        <Metric label="Tracked brand" value={latest.brand_name} hint="Current default context" />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="p-5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] lg:col-span-3">
          <p className="text-xs uppercase tracking-[0.15em] text-neutral-500">Latest query</p>
          <p className="mt-3 text-lg font-medium leading-snug text-white">{latest.query}</p>
          <p className="mt-2 text-sm text-neutral-400">Score {Math.round(latest.score_data?.totalScore ?? 0)}  - {new Date(latest.created_at).toLocaleString()}</p>
          <div className="mt-4 flex gap-2">
            <Link href={`/report/${latest.id}`} className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">Open report</Link>
            <Link href="/dashboard/run" className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-black hover:opacity-90">Run again</Link>
          </div>
        </Card>

        <Card className="p-5 shadow-[0_12px_30px_rgba(0,0,0,0.25)] lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Recent diagnostics</p>
            <Link href="/dashboard/history" className="text-xs text-neutral-400 underline underline-offset-4">View all</Link>
          </div>
          <div className="space-y-2">
            {scansWithData.slice(0, 6).map((scan) => (
              <Link key={scan.id} href={`/report/${scan.id}`} className="block rounded-xl border border-white/10 bg-white/2 px-3 py-2.5 transition hover:bg-white/8">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-neutral-200">{scan.query}</span>
                  <span className="text-sm font-semibold text-white">{Math.round(scan.score_data?.totalScore ?? 0)}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.13em] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-neutral-400">{hint}</p>
    </Card>
  );
}
