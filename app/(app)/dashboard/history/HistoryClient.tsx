"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Input } from "@/components/ui/primitives";

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

export function HistoryClient({ initialItems }: { initialItems: HistoryItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(() => {
    let items = applyFilter(initialItems, filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((item) => item.query.toLowerCase().includes(q) || item.brand.toLowerCase().includes(q));
    }
    return items;
  }, [initialItems, filter, search]);

  const total = initialItems.length;
  const avgScore = total ? Math.round(initialItems.reduce((a, i) => a + i.aeoScore, 0) / total) : 0;

  return (
    <div className="mx-auto w-full max-w-[1160px] space-y-5">
      <Card className="border-white/15 bg-gradient-to-br from-[#1e1530] via-[#141922] to-[#0f1113] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">History</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Every diagnostic, in one timeline</h1>
            <p className="mt-2 text-sm text-neutral-300">Filter by time, scan quickly, and jump into full reports.</p>
          </div>
          <Link href="/dashboard/run" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90">
            New diagnostic
          </Link>
        </div>
      </Card>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search query or brand" />
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
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total diagnostics" value={`${total}`} />
        <Stat label="Average score" value={`${avgScore}`} />
        <Stat label="Visible mentions" value={`${(initialItems.reduce((a, i) => a + i.mentionCount, 0) / (total || 1)).toFixed(1)}/3`} />
      </section>

      {filtered.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-neutral-400">No matching diagnostics found.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/report/${item.id}`}
              className="block rounded-2xl border border-white/10 bg-[var(--color-surface)] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{item.query}</p>
                  <p className="mt-1 text-xs text-neutral-400">{item.brand} | {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{item.aeoScore}</p>
                  <p className="text-xs text-neutral-400">{item.visibility}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.13em] text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </Card>
  );
}
