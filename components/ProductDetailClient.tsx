"use client";

import { useState } from "react";
import Image from "next/image";
import type { AnalysisResult, ProductDetailPayload } from "@/lib/types";

type ProductDetailInitial = ProductDetailPayload & {
  platform?: string;
  lastAnalyzed?: string | null;
  freeLimitReached?: boolean;
};

function scoreTone(score: number) {
  if (score < 30) return "text-red-600";
  if (score <= 70) return "text-amber-600";
  return "text-emerald-600";
}

export default function ProductDetailClient({ initial, productId }: { initial: ProductDetailInitial; productId: string }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(initial.latestAnalysis || null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/products/${productId}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const body = (await res.json()) as { result?: AnalysisResult; error?: string };
    setLoading(false);

    if (!res.ok || !body.result) {
      setError(body.error || "Failed to run analysis");
      return;
    }

    setResult(body.result);
  }

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src={initial.product.image || "https://placehold.co/200x120?text=Product"}
            alt={initial.product.name}
            width={96}
            height={64}
            className="h-16 w-24 rounded-xl object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold">{initial.product.name}</h1>
            <p className="text-sm text-slate-600">
              {initial.platform || "Unknown"} • Last analyzed: {initial.lastAnalyzed ? new Date(initial.lastAnalyzed).toLocaleString() : "Never"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. best protein powder for beginners" className="flex-1 rounded-full border border-slate-300 px-4 py-2" />
          <button disabled={loading || !query || initial.freeLimitReached} onClick={runAnalysis} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Running..." : "Run Analysis"}
          </button>
        </div>
        {initial.freeLimitReached ? <p className="mt-2 text-sm text-amber-700">Free plan daily analysis limit reached. Upgrade to continue.</p> : null}
      </section>

      {result ? (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            {result.modelResults?.map((r) => (
              <article key={r.model} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-semibold uppercase">{r.model}</h3>
                <p className="mt-2 text-sm text-slate-700">{r.response}</p>
                <p className="mt-3 text-xs text-slate-600">Mentions product? {r.mentionDetected ? "Yes" : "No"}</p>
                <p className="text-xs text-slate-600">Position: {r.mentionPosition ?? "N/A"}</p>
              </article>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-500">Visibility Score</p>
            <p className={`mt-2 text-5xl font-bold ${scoreTone(result.score || 0)}`}>{result.score || 0}/100</p>
            <p className="mt-2 text-sm text-slate-600">Appears in {result.mentions}/{result.totalModels} AI models</p>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold">Insights</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {result.insights?.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
