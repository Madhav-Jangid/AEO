import { FREE_LIMITS } from "@/lib/config/limits";
import { createClient } from "@/lib/supabase/server";
import type { AnalysisResult, ProductDetailPayload, ProductPreview, StorePlatform } from "@/lib/types";

interface ProductQueryRow {
  id: string;
  store_id: string;
  name: string;
  image: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  stores: { platform: StorePlatform };
  analyses: Array<{ score: number; created_at: string }>;
}

export async function getSessionUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function ensureAppUser() {
  const supabase = await createClient();
  // Prefer getUser() (server-validated) so RLS auth.uid() resolves correctly.
  // Fall back to getSession() only if the auth server is unreachable.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  let authUser = userData?.user ?? null;
  if (!authUser || userError) {
    const { data: sessionData } = await supabase.auth.getSession();
    authUser = sessionData.session?.user ?? null;
  }
  if (!authUser) return null;

  const { data: existing } = await supabase.from("users").select("*").eq("id", authUser.id).maybeSingle();
  if (existing) return existing;

  const payload = {
    id: authUser.id,
    email: authUser.email ?? "",
    plan: "free",
    onboarding_complete: false,
  };

  const { data } = await supabase.from("users").insert(payload).select("*").single();
  return data;
}

export function mockProductPreview(url: string, platform: StorePlatform): ProductPreview[] {
  const token = new URL(url).hostname.replace("www.", "").split(".")[0] || platform;
  return [
    { name: `${token} Essentials Starter Pack`, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300" },
    { name: `${token} Premium Daily Formula`, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" },
    { name: `${token} Value Bundle`, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300" },
  ];
}

export async function getDashboardPayload(userId: string) {
  const supabase = await createClient();

  const [{ data: stores }, { data: products }, { data: todayAnalyses }] = await Promise.all([
    supabase.from("stores").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*, stores!inner(platform), analyses(score, created_at)")
      .eq("stores.user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("usage_tracking")
      .select("daily_analysis_count")
      .eq("user_id", userId)
      .eq("date", new Date().toISOString().slice(0, 10))
      .maybeSingle(),
  ]);

  const rows = ((products ?? []) as ProductQueryRow[]).map((p) => ({
    id: p.id,
    store_id: p.store_id,
    name: p.name,
    image: p.image,
    metadata: p.metadata || {},
    created_at: p.created_at,
    latestScore: p.analyses?.[0]?.score ?? 0,
    platform: p.stores.platform,
  }));

  const avg = rows.length ? Math.round(rows.reduce((sum, p) => sum + p.latestScore, 0) / rows.length) : 0;
  const top = rows.sort((a, b) => b.latestScore - a.latestScore)[0];

  return {
    stats: {
      totalProducts: rows.length,
      avgVisibilityScore: avg,
      analysesToday: todayAnalyses?.daily_analysis_count ?? 0,
      topProductName: top?.name ?? "None yet",
    },
    products: rows,
    stores: stores ?? [],
  };
}

export async function getProductDetail(userId: string, productId: string): Promise<ProductDetailPayload | null> {
  const supabase = await createClient();
  const { data: productRow } = await supabase
    .from("products")
    .select("*, stores!inner(platform, user_id)")
    .eq("id", productId)
    .eq("stores.user_id", userId)
    .maybeSingle();

  if (!productRow) return null;

  const { data: analyses } = await supabase
    .from("analyses")
    .select("results_json, score, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1);

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("daily_analysis_count")
    .eq("user_id", userId)
    .eq("date", new Date().toISOString().slice(0, 10))
    .maybeSingle();

  const latest = analyses?.[0];

  return {
    product: {
      id: productRow.id,
      name: productRow.name,
      image: productRow.image,
      metadata: productRow.metadata || {},
      // created_at: productRow.created_at,
    },
    // platform: productRow.stores.platform,
    // lastAnalyzed: latest?.created_at ?? null,
    latestAnalysis: (latest?.results_json as AnalysisResult) ?? null,
    analysesToday: usage?.daily_analysis_count ?? 0,
    // freeLimitReached: (usage?.daily_analysis_count ?? 0) >= FREE_LIMITS.analysesPerDay,
  };
}

export async function incrementDailyUsage(userId: string) {
  const supabase = await createClient();
  const date = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase.from("usage_tracking").select("*").eq("user_id", userId).eq("date", date).maybeSingle();

  if (!existing) {
    await supabase.from("usage_tracking").insert({ user_id: userId, date, daily_analysis_count: 1 });
    return 1;
  }

  const next = existing.daily_analysis_count + 1;
  await supabase.from("usage_tracking").update({ daily_analysis_count: next }).eq("user_id", userId).eq("date", date);
  return next;
}
