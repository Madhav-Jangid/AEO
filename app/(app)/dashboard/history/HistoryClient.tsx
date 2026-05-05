"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type HistoryItem = {
  id: string;
  query: string;
  brand: string;
  date: string;
  rawDate: string;
  aeoScore: number;
  visibility: string;
  mentionCount: number;
  trend: "up" | "down" | "neutral";
};

const FILTERS = ["All", "7D", "30D", "3M"] as const;
type Filter = (typeof FILTERS)[number];

function applyFilter(items: HistoryItem[], filter: Filter) {
  if (filter === "All") return items;

  const now = Date.now();
  const ranges: Record<Exclude<Filter, "All">, number> = {
    "7D": 7 * 86400_000,
    "30D": 30 * 86400_000,
    "3M": 90 * 86400_000,
  };

  return items.filter((item) => new Date(item.rawDate).getTime() >= now - ranges[filter]);
}

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 40) return "text-amber-300";
  return "text-red-400";
}

export function HistoryClient({ initialItems }: { initialItems: HistoryItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    let items = applyFilter(initialItems, filter);

    if (search.trim()) {
      const query = search.toLowerCase();
      items = items.filter(
        (item) => item.query.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query),
      );
    }

    return items;
  }, [initialItems, filter, search]);

  const total = initialItems.length;
  const avgScore = total
    ? Math.round(initialItems.reduce((acc, item) => acc + item.aeoScore, 0) / total)
    : 0;
  const avgVisibility = total
    ? (initialItems.reduce((acc, item) => acc + item.mentionCount, 0) / total).toFixed(1)
    : "0";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#221536] via-[#181623] to-[#101112] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-purple-300/80">History</p>
            <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Scan timeline and trends</h1>
            <p className="mt-2 text-sm text-neutral-300">Track score movement, visibility consistency, and report history.</p>
          </div>
          <Link href="/dashboard/run" className="rounded-xl bg-[#914bf1] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
            Run Scan
          </Link>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/10 bg-[#151719] p-4 md:grid-cols-[1fr_auto] md:items-center">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by query or brand"
          className="w-full rounded-xl border border-white/10 bg-[#101112] px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/60"
        />

        <div className="flex gap-2">
          {FILTERS.map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                filter === value
                  ? "border-purple-300/50 bg-purple-400/20 text-purple-100"
                  : "border-white/10 text-neutral-400 hover:bg-white/5"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total Scans" value={String(total)} />
        <Stat label="Average Score" value={String(avgScore)} />
        <Stat label="Average Visibility" value={`${avgVisibility}/3`} />
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-white/10 bg-[#151719] p-10 text-center">
          <p className="text-sm text-neutral-400">No matching scans found.</p>
        </section>
      ) : (
        <section className="space-y-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/report/${item.id}`}
              className="block rounded-2xl border border-white/10 bg-[#151719] p-4 transition hover:border-purple-300/25 hover:bg-[#1a1d20]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{item.query}</p>
                  <p className="mt-1 text-xs text-neutral-400">{item.brand} • {item.date}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={`font-semibold ${scoreColor(item.aeoScore)}`}>{item.aeoScore}</span>
                  <span className="text-neutral-400">{item.visibility}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#151719] p-4">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-500">{label}</p>
    </article>
  );
}

