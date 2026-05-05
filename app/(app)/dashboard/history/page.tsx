import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistoryClient, type HistoryItem } from "./HistoryClient";
import type { Scan } from "@/lib/types";

/* ─────────────────────────────────────────────── */
/* 🧠 Data Transformer (IMPORTANT for scaling) */
/* ─────────────────────────────────────────────── */
function transformScansToHistory(scans: Scan[]): HistoryItem[] {
  return scans.map((scan, index) => {
    const score = Math.round(scan.score_data?.totalScore ?? 0);
    const mentionCount = scan.score_data?.mentionCount ?? 0;

    const prev = scans[index + 1];
    const prevScore = prev
      ? Math.round(prev.score_data?.totalScore ?? 0)
      : null;

    const trend: HistoryItem["trend"] =
      prevScore === null
        ? "neutral"
        : score > prevScore
          ? "up"
          : score < prevScore
            ? "down"
            : "neutral";

    return {
      id: scan.id,
      query: scan.query,
      brand: scan.brand_name,

      /* UI formatted date */
      date: new Date(scan.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),

      /* raw date for filtering */
      rawDate: scan.created_at,

      aeoScore: score,
      visibility: `${mentionCount}/3 AIs`,
      mentionCount,
      trend,
    };
  });
}

/* ─────────────────────────────────────────────── */
/* 🚀 Page */
/* ─────────────────────────────────────────────── */
export default async function HistoryPage() {
  const supabase = await createClient();

  /* Auth */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  /* Fetch */
  const { data, error } = await supabase
    .from("scans")
    .select("id, query, brand_name, score_data, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("History fetch error:", error);
    return (
      <div className="p-6 text-sm text-red-400">
        Failed to load history.
      </div>
    );
  }

  const scans = (data || []) as Scan[];

  /* Transform */
  const historyItems = transformScansToHistory(scans);

  /* Render */
  return <HistoryClient initialItems={historyItems} />;
}