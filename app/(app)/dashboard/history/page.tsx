import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Scan } from "@/lib/types";
import { HistoryClient, type HistoryItem } from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const { data: rawScans } = await supabase
    .from("scans")
    .select("id, query, brand_name, score_data, created_at")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  const scans = (rawScans || []) as Scan[];

  const historyItems: HistoryItem[] = scans.map((scan, index) => {
    const score = Math.round(scan.score_data?.totalScore ?? 0);
    const mentionCount = scan.score_data?.mentionCount ?? 0;
    const prevScan = scans[index + 1];
    const prevScore = prevScan ? Math.round(prevScan.score_data?.totalScore ?? 0) : null;
    const trend: HistoryItem["trend"] =
      prevScore === null ? "neutral" : score > prevScore ? "up" : score < prevScore ? "down" : "neutral";

    return {
      id: scan.id,
      query: scan.query,
      brand: scan.brand_name,
      date: new Date(scan.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      rawDate: scan.created_at,
      aeoScore: score,
      visibility: `${mentionCount}/3 AIs`,
      mentionCount,
      trend,
    };
  });

  return <HistoryClient initialItems={historyItems} />;
}
