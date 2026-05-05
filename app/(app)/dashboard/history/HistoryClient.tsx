"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

/* ─── Icons ─── */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(34,197,94)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
  </svg>
);

/* ─── Types ─── */
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

/* ─── Utils ─── */
const FILTERS = ["All", "Last 7 days", "Last 30 days", "Last 3 months"] as const;
type Filter = (typeof FILTERS)[number];

function applyDateFilter(items: HistoryItem[], filter: Filter): HistoryItem[] {
  if (filter === "All") return items;
  const now = Date.now();
  const msMap: Record<Exclude<Filter, "All">, number> = {
    "Last 7 days": 7 * 86400_000,
    "Last 30 days": 30 * 86400_000,
    "Last 3 months": 90 * 86400_000,
  };
  const cutoff = now - msMap[filter as Exclude<Filter, "All">];
  return items.filter((i) => new Date(i.rawDate).getTime() >= cutoff);
}

function scoreColor(score: number) {
  if (score >= 70) return "rgb(34,197,94)";
  if (score >= 40) return "rgb(251,191,36)";
  return "rgb(239,68,68)";
}

function visibilityColor(v: string) {
  if (v.startsWith("3/")) return "rgb(34,197,94)";
  if (v.startsWith("2/") || v.startsWith("1/")) return "rgb(251,191,36)";
  return "rgb(239,68,68)";
}

/* ─── Main Component ─── */
export function HistoryClient({ initialItems }: { initialItems: HistoryItem[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = applyDateFilter(initialItems, filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) => i.query.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q)
      );
    }
    return items;
  }, [initialItems, filter, search]);

  /* ── Stats computed from ALL initial items (not filtered) ── */
  const totalScans = initialItems.length;
  const avgScore =
    totalScans > 0
      ? Math.round(initialItems.reduce((a, i) => a + i.aeoScore, 0) / totalScans)
      : 0;
  const avgVisibility =
    totalScans > 0
      ? (initialItems.reduce((a, i) => a + i.mentionCount, 0) / totalScans).toFixed(1)
      : "0";
  const thisMonth = initialItems.filter((i) => {
    const d = new Date(i.rawDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-outfit)" }}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "rgb(255,255,255)" }}>
          History
        </h1>
        <p className="text-base mt-1" style={{ color: "rgb(217,217,217)" }}>
          Track your AI visibility over time
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "rgb(156,163,175)" }}
          >
            <SearchIcon />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search queries or brands..."
            style={{
              width: "100%",
              backgroundColor: "rgb(39,40,41)",
              color: "rgb(255,255,255)",
              border: "1px solid rgb(75,85,99)",
              borderRadius: "8px",
              padding: "10px 16px 10px 36px",
              fontFamily: "var(--font-outfit)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        <div className="flex gap-3 items-center">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              style={{
                backgroundColor: "transparent",
                color: "rgb(217,217,217)",
                border: "1px solid rgb(75,85,99)",
                borderRadius: "8px",
                padding: "10px 16px",
                fontFamily: "var(--font-outfit)",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
              {filter === "All" ? "Filter" : filter}
            </button>
            {filterOpen && (
              <div
                className="absolute top-full mt-1 right-0 z-10 py-1 min-w-[160px]"
                style={{
                  backgroundColor: "rgb(39,40,41)",
                  border: "1px solid rgb(75,85,99)",
                  borderRadius: "8px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setFilterOpen(false); }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 14px",
                      fontSize: "14px",
                      fontFamily: "var(--font-outfit)",
                      color: f === filter ? "rgb(145,75,241)" : "rgb(217,217,217)",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/run"
            style={{
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              borderRadius: "8px",
              padding: "10px 18px",
              fontFamily: "var(--font-outfit)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Run New Diagnostic
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Scans", value: totalScans, color: "rgb(255,255,255)" },
          { label: "Avg AEO Score", value: avgScore, color: "rgb(34,197,94)" },
          { label: "Avg Visibility", value: `${avgVisibility}/3`, color: "rgb(251,191,36)" },
          { label: "This Month", value: thisMonth, color: "rgb(145,75,241)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="p-4 text-center"
            style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "16px" }}
          >
            <p className="text-2xl font-bold mb-1" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: "rgb(217,217,217)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Table or Empty */}
      {filtered.length === 0 ? (
        <div
          className="p-12 text-center"
          style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
        >
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(145,75,241,0.15)" }}
          >
            <SearchIcon />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: "rgb(255,255,255)" }}>
            No results found
          </h3>
          <p className="text-sm mb-6" style={{ color: "rgb(217,217,217)" }}>
            {search ? "Try different search terms" : "Run your first diagnostic to see results here"}
          </p>
          <Link
            href="/dashboard/run"
            style={{
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              borderRadius: "8px",
              padding: "10px 20px",
              fontFamily: "var(--font-outfit)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Run Diagnostic
          </Link>
        </div>
      ) : (
        <div
          className="overflow-hidden"
          style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  {["Query", "Brand", "Date", "AEO Score", "Visibility", ""].map((h) => (
                    <th
                      key={h}
                      className="text-left p-4 text-xs uppercase font-semibold tracking-wider"
                      style={{ color: "rgb(156,163,175)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        index < filtered.length - 1
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "none",
                    }}
                  >
                    <td className="p-4">
                      <p
                        className="font-medium text-sm max-w-xs truncate"
                        style={{ color: "rgb(255,255,255)" }}
                      >
                        &ldquo;{item.query}&rdquo;
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm" style={{ color: "rgb(217,217,217)" }}>
                        {item.brand}
                      </span>
                    </td>
                    <td className="p-4">
                      <div
                        className="flex items-center gap-1.5 text-sm"
                        style={{ color: "rgb(217,217,217)" }}
                      >
                        <CalendarIcon />
                        {item.date}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-sm font-bold"
                          style={{ color: scoreColor(item.aeoScore) }}
                        >
                          {item.aeoScore}
                        </span>
                        {item.trend === "up" ? (
                          <TrendUpIcon />
                        ) : item.trend === "down" ? (
                          <TrendDownIcon />
                        ) : null}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2.5 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: `${visibilityColor(item.visibility)}20`,
                          color: visibilityColor(item.visibility),
                        }}
                      >
                        {item.visibility}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/report/${item.id}`}
                        className="text-sm font-medium hover:opacity-80 transition-opacity"
                        style={{ color: "rgb(145,75,241)", textDecoration: "none" }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
