"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEngineMeta, AVAILABLE_MODELS } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

/* ─── Brand highlight helper ─── */
function HighlightedText({
  text,
  brand,
}: {
  text: string;
  brand: string;
}) {
  if (!text || !brand) return <>{text}</>;
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === brand.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: "rgba(145,75,241,0.25)",
              color: "rgb(192,132,252)",
              borderRadius: "3px",
              padding: "0 3px",
              fontWeight: 600,
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── Single engine card ─── */
function EngineCard({
  engine,
  brand,
  failed,
  errorMsg,
}: {
  engine: EngineAnalysis;
  brand: string;
  failed?: boolean;
  errorMsg?: string;
}) {
  const { name, color } = getEngineMeta(engine.engine);
  const [expanded, setExpanded] = useState(true);

  return (
    <div
      style={{
        backgroundColor: "rgb(39,40,41)",
        borderRadius: "20px",
        border: `1px solid ${failed ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.06)"}`,
        overflow: "hidden",
        fontFamily: "var(--font-outfit)",
      }}
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-bold text-sm" style={{ color }}>
            {name}
          </span>
          {failed && (
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "rgb(239,68,68)" }}
            >
              failed
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!failed && (
            <div className="flex items-center gap-3">
              {engine.mentioned ? (
                <span
                  className="px-2.5 py-0.5 text-xs font-bold rounded-full"
                  style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "rgb(34,197,94)" }}
                >
                  ✓ Mentioned
                </span>
              ) : (
                <span
                  className="px-2.5 py-0.5 text-xs font-bold rounded-full"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "rgb(239,68,68)" }}
                >
                  ✗ Not found
                </span>
              )}
              {engine.mentioned && engine.position && (
                <span className="text-xs font-medium" style={{ color: "rgb(251,191,36)" }}>
                  #{engine.position}
                </span>
              )}
              {engine.mentioned && engine.sentiment && (
                <span
                  className="text-xs capitalize"
                  style={{
                    color:
                      engine.sentiment === "positive"
                        ? "rgb(34,197,94)"
                        : engine.sentiment === "negative"
                        ? "rgb(239,68,68)"
                        : "rgb(156,163,175)",
                  }}
                >
                  {engine.sentiment}
                </span>
              )}
            </div>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-xs hover:opacity-80 transition-opacity"
            style={{ color: "rgb(107,114,128)" }}
          >
            {expanded ? "Collapse ▲" : "Expand ▼"}
          </button>
        </div>
      </div>

      {/* Response body */}
      {expanded && (
        <div className="p-5">
          {failed ? (
            <p className="text-sm italic" style={{ color: "rgb(239,68,68)" }}>
              {errorMsg || "This model failed to respond. Check your API key."}
            </p>
          ) : (
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "rgb(217,217,217)" }}
            >
              <HighlightedText text={engine.response} brand={brand} />
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Pending spinner card ─── */
function PendingCard({ modelId }: { modelId: string }) {
  const { name, color } = getEngineMeta(modelId);
  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{
        backgroundColor: "rgb(39,40,41)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "var(--font-outfit)",
      }}
    >
      {/* Spinner */}
      <div className="relative w-5 h-5 shrink-0">
        <div
          className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: `${color} transparent transparent transparent` }}
        />
      </div>
      <span className="font-medium text-sm" style={{ color }}>
        {name}
      </span>
      <span className="text-sm animate-pulse" style={{ color: "rgb(107,114,128)" }}>
        Querying…
      </span>
    </div>
  );
}

/* ─── Score badge ─── */
function ScoreBar({ score, grade }: { score: number; grade: string }) {
  const color =
    score >= 70 ? "rgb(34,197,94)" : score >= 40 ? "rgb(251,191,36)" : "rgb(239,68,68)";
  return (
    <div
      className="flex items-center gap-6 p-6"
      style={{
        backgroundColor: "rgb(39,40,41)",
        borderRadius: "20px",
        fontFamily: "var(--font-outfit)",
      }}
    >
      <div className="text-center shrink-0">
        <span className="block text-5xl font-black" style={{ color }}>
          {score}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgb(156,163,175)" }}>
          Grade {grade}
        </span>
      </div>
      <div className="flex-1">
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs" style={{ color: "rgb(107,114,128)" }}>0</span>
          <span className="text-xs" style={{ color: "rgb(107,114,128)" }}>100</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main client component ─── */
export function LiveReport() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q") ?? "";
  const brand = searchParams.get("b") ?? "";
  const modelsStr = searchParams.get("m") ?? "";
  const userId = searchParams.get("u") ?? "";

  const selectedModels = modelsStr
    ? modelsStr.split(",").filter(Boolean)
    : AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id);

  const [arrived, setArrived] = useState<EngineAnalysis[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string[]>(selectedModels);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!query || !brand || started.current) return;
    started.current = true;

    const controller = new AbortController();
    let buffer = "";

    (async () => {
      try {
        const res = await fetch("/api/scan/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, brandName: brand, userId, selectedModels }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setFatalError(`Request failed: ${res.status}`);
          setDone(true);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";

          for (const event of events) {
            if (!event.startsWith("data: ")) continue;
            try {
              const parsed = JSON.parse(event.slice(6)) as {
                type: string;
                data?: EngineAnalysis;
                modelId?: string;
                error?: string;
                scanId?: string | null;
                scoreData?: ScoreData;
                message?: string;
              };

              if (parsed.type === "engine" && parsed.data) {
                setArrived((prev) => [...prev, parsed.data!]);
                setPending((prev) => prev.filter((m) => m !== parsed.data!.engine));
              } else if (parsed.type === "engine_error") {
                setErrors((prev) => ({
                  ...prev,
                  [parsed.modelId!]: parsed.error ?? "Unknown error",
                }));
                if (parsed.data) {
                  setArrived((prev) => [...prev, parsed.data!]);
                }
                setPending((prev) => prev.filter((m) => m !== parsed.modelId));
              } else if (parsed.type === "complete") {
                if (parsed.scoreData) setScoreData(parsed.scoreData);
                setScanId(parsed.scanId ?? null);
                setDone(true);
                // Auto-redirect to saved report after 4 s if saved
                if (parsed.scanId) {
                  setTimeout(() => router.replace(`/report/${parsed.scanId}`), 4000);
                }
              } else if (parsed.type === "error") {
                setFatalError(parsed.message ?? "Unknown error");
                setDone(true);
              }
            } catch {
              // ignore JSON parse errors
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setFatalError(String(err));
          setDone(true);
        }
      }
    })();

    return () => {
      controller.abort();
      // Reset so React 18 Strict Mode's second mount can restart the stream
      started.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!query || !brand) {
    return (
      <div className="text-center py-20" style={{ fontFamily: "var(--font-outfit)" }}>
        <p className="text-lg mb-6" style={{ color: "rgb(217,217,217)" }}>
          Nothing to scan.
        </p>
        <Link
          href="/dashboard/run"
          style={{ color: "rgb(145,75,241)", textDecoration: "none" }}
        >
          ← Go back to Run Diagnostic
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: "var(--font-outfit)" }}>
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "rgb(255,255,255)" }}>
            Live Diagnostic
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgb(217,217,217)" }}>
            &ldquo;{query}&rdquo; &bull; Brand:{" "}
            <strong style={{ color: "rgb(192,132,252)" }}>{brand}</strong>
          </p>
        </div>
        {done && scanId && (
          <Link
            href={`/report/${scanId}`}
            className="shrink-0 font-medium text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              padding: "8px 18px",
              borderRadius: "8px",
              textDecoration: "none",
            }}
          >
            View Saved Report →
          </Link>
        )}
        {done && !scanId && (
          <Link
            href="/dashboard/run"
            className="shrink-0 text-sm hover:opacity-80 transition-opacity"
            style={{ color: "rgb(145,75,241)", textDecoration: "none" }}
          >
            ← New Diagnostic
          </Link>
        )}
      </div>

      {/* ── Fatal error ── */}
      {fatalError && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "rgb(239,68,68)",
          }}
        >
          Error: {fatalError}
        </div>
      )}

      {/* ── Score (appears when complete) ── */}
      {scoreData && (
        <div className="space-y-2">
          <ScoreBar score={scoreData.totalScore} grade={scoreData.grade} />
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Mentions",
                value: `${scoreData.mentionCount}/${arrived.filter((e) => !e.isFallback).length}`,
                color: "rgb(145,75,241)",
              },
              {
                label: "Mention Score",
                value: scoreData.mentionScore,
                color: "rgb(249,115,22)",
              },
              {
                label: "Sentiment Score",
                value: scoreData.sentimentScore,
                color: "rgb(34,197,94)",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="p-4 text-center"
                style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "14px" }}
              >
                <p className="text-xl font-bold mb-0.5" style={{ color }}>
                  {value}
                </p>
                <p className="text-xs" style={{ color: "rgb(156,163,175)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pending models (spinners) ── */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "rgb(107,114,128)" }}>
            Querying…
          </p>
          {pending.map((id) => (
            <PendingCard key={id} modelId={id} />
          ))}
        </div>
      )}

      {/* ── Arrived engine cards ── */}
      {arrived.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: "rgb(107,114,128)" }}>
            Responses — brand{" "}
            <mark
              style={{
                backgroundColor: "rgba(145,75,241,0.2)",
                color: "rgb(192,132,252)",
                borderRadius: "3px",
                padding: "0 3px",
              }}
            >
              {brand}
            </mark>{" "}
            is highlighted
          </p>
          {arrived.map((engine) => (
            <EngineCard
              key={engine.engine}
              engine={engine}
              brand={brand}
              failed={engine.isFallback && !!errors[engine.engine]}
              errorMsg={errors[engine.engine]}
            />
          ))}
        </div>
      )}

      {/* ── Redirect notice ── */}
      {done && scanId && (
        <div
          className="p-4 rounded-xl text-sm text-center animate-pulse"
          style={{
            backgroundColor: "rgba(145,75,241,0.1)",
            border: "1px solid rgba(145,75,241,0.3)",
            color: "rgb(192,132,252)",
          }}
        >
          Report saved! Redirecting to permanent report in a few seconds…
        </div>
      )}

      {/* ── No save notice ── */}
      {done && !scanId && !fatalError && (
        <div
          className="p-4 rounded-xl text-sm"
          style={{
            backgroundColor: "rgba(251,191,36,0.1)",
            border: "1px solid rgba(251,191,36,0.25)",
            color: "rgb(251,191,36)",
          }}
        >
          Results not saved (session issue). You can still review responses above.{" "}
          <Link href="/dashboard/run" style={{ color: "rgb(251,191,36)", fontWeight: 600 }}>
            Run again ↗
          </Link>
        </div>
      )}
    </div>
  );
}
