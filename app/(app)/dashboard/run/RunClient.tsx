"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AVAILABLE_MODELS, getEngineMeta } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

/* ─── Platform message templates ─── */
const TEMPLATES = [
  (q: string, n: number) => `Scanning "${q}" across ${n} AI engine${n !== 1 ? "s" : ""} to check your brand's visibility…`,
  (q: string) => `Querying multiple AI systems with your customer's exact search. Looking for your brand among the recommendations for "${q}"…`,
  (_q: string) => `Analyzing how leading AI shopping assistants respond to your customer's query in real time…`,
  (q: string) => `Running "${q}" through AI engines simultaneously. We'll highlight every mention of your brand as responses arrive.`,
];
function platformMsg(query: string, count: number) {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)](query, count);
}

/* ─── Brand highlight ─── */
function Highlighted({ text, brand }: { text: string; brand: string }) {
  if (!text || !brand) return <>{text}</>;
  const esc = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === brand.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: "rgba(145,75,241,0.25)",
              color: "rgb(192,132,252)",
              borderRadius: "3px",
              padding: "0 2px",
              fontWeight: 700,
            }}
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ─── Model response card (fixed width for horizontal scroll) ─── */
function ModelCard({
  engine,
  brand,
  errorMsg,
}: {
  engine: EngineAnalysis;
  brand: string;
  errorMsg?: string;
}) {
  const { name, color } = getEngineMeta(engine.engine);
  return (
    <div
      style={{
        minWidth: "340px",
        maxWidth: "340px",
        backgroundColor: "rgb(28,29,30)",
        borderRadius: "16px",
        border: `1px solid ${engine.isFallback ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
          <span style={{ color, fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-outfit)" }}>
            {name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {engine.isFallback ? (
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "99px",
                backgroundColor: "rgba(239,68,68,0.12)",
                color: "rgb(239,68,68)",
                fontWeight: 600,
              }}
            >
              Error
            </span>
          ) : (
            <>
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "99px",
                  backgroundColor: engine.mentioned
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(239,68,68,0.1)",
                  color: engine.mentioned ? "rgb(34,197,94)" : "rgb(239,68,68)",
                  fontWeight: 600,
                }}
              >
                {engine.mentioned ? "✓ Mentioned" : "✗ Not found"}
              </span>
              {engine.mentioned && engine.position && (
                <span style={{ fontSize: "11px", color: "rgb(251,191,36)", fontWeight: 700 }}>
                  #{engine.position}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Response body */}
      <div
        style={{
          padding: "14px 16px",
          flex: 1,
          overflowY: "auto",
          maxHeight: "300px",
          minHeight: "120px",
        }}
      >
        {engine.isFallback ? (
          <p style={{ color: "rgb(239,68,68)", fontSize: "13px", fontStyle: "italic", lineHeight: 1.6 }}>
            {errorMsg || "This model failed to respond. Check your API key."}
          </p>
        ) : (
          <p
            style={{
              color: "rgb(210,210,210)",
              fontSize: "13px",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              fontFamily: "var(--font-outfit)",
            }}
          >
            <Highlighted text={engine.response} brand={brand} />
          </p>
        )}
      </div>

      {/* Sentiment footer */}
      {!engine.isFallback && engine.mentioned && engine.sentiment && (
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span style={{ fontSize: "11px", color: "rgb(107,114,128)" }}>Sentiment:</span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "capitalize",
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
      style={{
        minWidth: "200px",
        maxWidth: "200px",
        backgroundColor: "rgb(28,29,30)",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "16px",
        flexShrink: 0,
      }}
    >
      <div
        className="animate-spin"
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: color,
          flexShrink: 0,
        }}
      />
      <div>
        <p style={{ color, fontSize: "13px", fontWeight: 600, fontFamily: "var(--font-outfit)" }}>
          {name}
        </p>
        <p className="animate-pulse" style={{ color: "rgb(107,114,128)", fontSize: "12px" }}>
          Querying…
        </p>
      </div>
    </div>
  );
}

/* ─── Final report card ─── */
function ReportCard({
  scoreData,
  scanId,
  brand,
  query,
  onNewScan,
}: {
  scoreData: ScoreData;
  scanId: string | null;
  brand: string;
  query: string;
  onNewScan: () => void;
}) {
  const { totalScore, grade, mentionCount, engines, mentionScore, sentimentScore, competitors } =
    scoreData;
  const totalEngines = engines.filter((e) => !e.isFallback).length || engines.length;
  const gradeColor =
    totalScore >= 70
      ? "rgb(34,197,94)"
      : totalScore >= 40
      ? "rgb(251,191,36)"
      : "rgb(239,68,68)";

  return (
    <div
      style={{
        backgroundColor: "rgb(39,40,41)",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        fontFamily: "var(--font-outfit)",
      }}
    >
      {/* Top label row */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <span
          style={{
            color: "rgb(107,114,128)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
          }}
        >
          AEO Diagnostic Report
        </span>
        <span style={{ color: "rgb(107,114,128)", fontSize: "12px" }}>
          Brand:{" "}
          <span style={{ color: "rgb(192,132,252)", fontWeight: 600 }}>{brand}</span>
          <span style={{ margin: "0 8px", opacity: 0.3 }}>·</span>
          <span style={{ color: "rgb(156,163,175)" }}>&ldquo;{query}&rdquo;</span>
        </span>
      </div>

      {/* Score + stats row */}
      <div
        style={{
          padding: "24px 20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Score circle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              border: `4px solid ${gradeColor}`,
              backgroundColor: `${gradeColor}12`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: gradeColor,
                fontSize: "30px",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {totalScore}
            </span>
            <span
              style={{
                color: gradeColor,
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Grade {grade}
            </span>
          </div>
          <span style={{ color: "rgb(107,114,128)", fontSize: "11px" }}>AEO Score</span>
        </div>

        {/* Stat tiles */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            minWidth: "220px",
          }}
        >
          {[
            { label: "Mentions", value: `${mentionCount}/${totalEngines}`, color: "rgb(145,75,241)" },
            { label: "Mention Score", value: mentionScore, color: "rgb(249,115,22)" },
            { label: "Sentiment", value: sentimentScore, color: "rgb(34,197,94)" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                backgroundColor: "rgb(16,17,18)",
                borderRadius: "12px",
                padding: "12px",
                textAlign: "center",
              }}
            >
              <p style={{ color, fontSize: "20px", fontWeight: 800, marginBottom: "2px" }}>
                {value}
              </p>
              <p style={{ color: "rgb(107,114,128)", fontSize: "11px" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Competitors */}
      {competitors && competitors.length > 0 && (
        <div
          style={{
            padding: "0 20px 18px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: "16px",
          }}
        >
          <p
            style={{
              color: "rgb(107,114,128)",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "10px",
            }}
          >
            Competitors AI Mentioned
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {competitors.slice(0, 6).map((c, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  borderRadius: "99px",
                  fontSize: "12px",
                  backgroundColor: "rgb(16,17,18)",
                  color: "rgb(156,163,175)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {c.brand}
                <span style={{ color: "rgb(75,85,99)", marginLeft: "4px" }}>
                  ×{c.timesMentioned}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {scanId ? (
          <Link
            href={`/report/${scanId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              padding: "9px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 0 16px rgba(145,75,241,0.3)",
            }}
          >
            View Full Report →
          </Link>
        ) : (
          <span style={{ color: "rgb(107,114,128)", fontSize: "13px" }}>
            ⚠ Report not saved — log in to save results
          </span>
        )}
        <button
          onClick={onNewScan}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "transparent",
            color: "rgb(156,163,175)",
            padding: "9px 16px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "pointer",
            fontFamily: "var(--font-outfit)",
          }}
        >
          ← New Diagnostic
        </button>
      </div>
    </div>
  );
}

/* ─── Suggestions ─── */
const SUGGESTIONS = [
  "best protein powder for muscle gain",
  "top rated magnesium supplement for sleep",
  "best budget mechanical keyboard under $50",
  "most recommended pre-workout supplement",
  "best noise cancelling headphones 2024",
];

/* ─── Main component ─── */
interface RunClientProps {
  userId: string;
  savedBrand: string;
  userName: string;
}

export function RunClient({ userId, savedBrand, userName }: RunClientProps) {
  /* Form state */
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(savedBrand);
  const [selectedModels, setSelectedModels] = useState<string[]>(
    AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id)
  );

  /* Streaming state */
  type Phase = "idle" | "streaming" | "done";
  const [phase, setPhase] = useState<Phase>("idle");
  const [activeQuery, setActiveQuery] = useState("");
  const [activeBrand, setActiveBrand] = useState("");
  const [message, setMessage] = useState("");
  const [arrived, setArrived] = useState<EngineAnalysis[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const started = useRef(false);

  function toggleModel(id: string) {
    setSelectedModels((prev) =>
      prev.includes(id)
        ? prev.length > 1 ? prev.filter((m) => m !== id) : prev
        : [...prev, id]
    );
  }

  function resetToIdle() {
    setPhase("idle");
    setArrived([]);
    setErrors({});
    setPending([]);
    setScoreData(null);
    setScanId(null);
    setFatalError(null);
    started.current = false;
  }

  async function handleSubmit() {
    const q = query.trim();
    const b = brand.trim();
    if (!q || !b || selectedModels.length === 0) return;

    started.current = true;
    setActiveQuery(q);
    setActiveBrand(b);
    setMessage(platformMsg(q, selectedModels.length));
    setPending([...selectedModels]);
    setArrived([]);
    setErrors({});
    setScoreData(null);
    setScanId(null);
    setFatalError(null);
    setPhase("streaming");

    try {
      const res = await fetch("/api/scan/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, brandName: b, userId, selectedModels }),
      });
      if (!res.ok || !res.body) {
        setFatalError(`Request failed: ${res.status}`);
        setPhase("done");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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
              if (parsed.error) {
                setErrors((prev) => ({ ...prev, [parsed.modelId!]: parsed.error! }));
              }
              if (parsed.data) {
                setArrived((prev) => [...prev, parsed.data!]);
              }
              setPending((prev) => prev.filter((m) => m !== parsed.modelId));
            } else if (parsed.type === "complete") {
              if (parsed.scoreData) setScoreData(parsed.scoreData);
              setScanId(parsed.scanId ?? null);
              setPhase("done");
            } else if (parsed.type === "error") {
              setFatalError(parsed.message ?? "Unknown error");
              setPhase("done");
            }
          } catch {
            // ignore malformed SSE frame
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) setFatalError(err.message);
      setPhase("done");
    }
  }

  const firstName = userName.split(" ")[0] || "there";
  const canSubmit = query.trim().length > 0 && brand.trim().length > 0;

  /* ── IDLE: form ── */
  if (phase === "idle") {
    return (
      <div
        className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 pb-16"
        style={{ fontFamily: "var(--font-outfit)" }}
      >
        {/* Ambient glow */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "300px",
            background: "radial-gradient(ellipse, rgba(145,75,241,0.07) 0%, transparent 70%)",
            zIndex: 0,
          }}
        />

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8">
          {/* Greeting */}
          <div className="text-center">
            <h1
              className="font-bold mb-2"
              style={{ fontSize: "clamp(26px, 5vw, 40px)", color: "rgb(255,255,255)", lineHeight: 1.2 }}
            >
              Hello, {firstName} 👋
            </h1>
            <p style={{ color: "rgb(107,114,128)", fontSize: "16px" }}>
              What would your customers search for today?
            </p>
          </div>

          {/* Input card */}
          <div
            className="w-full"
            style={{
              backgroundColor: "rgb(39,40,41)",
              borderRadius: "20px",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            {/* Query row */}
            <div className="flex items-start gap-3 px-5 pt-5 pb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(145,75,241)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "3px", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgb(107,114,128)" }}>
                  Customer Query
                </label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder='e.g. "best magnesium supplement for sleep"'
                  rows={2}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "rgb(255,255,255)", fontSize: "15px", resize: "none", fontFamily: "var(--font-outfit)", lineHeight: 1.5 }}
                />
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)", margin: "0 20px" }} />

            {/* Brand row */}
            <div className="flex items-center gap-3 px-5 py-4">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgb(192,132,252)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "rgb(107,114,128)" }}>
                  Your Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                  placeholder='e.g. "LiveConscious" or "MagTech Pro"'
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "rgb(255,255,255)", fontSize: "15px", fontFamily: "var(--font-outfit)" }}
                />
              </div>
            </div>

            <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.06)" }} />

            {/* Models + submit */}
            <div className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_MODELS.map((m) => {
                  const on = selectedModels.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleModel(m.id)}
                      title={`${m.tagline}${!m.defaultEnabled ? " — requires API key" : ""}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "5px 10px", borderRadius: "99px", fontSize: "12px",
                        fontFamily: "var(--font-outfit)", fontWeight: 500, cursor: "pointer",
                        transition: "all 0.15s",
                        border: `1px solid ${on ? m.color : "rgba(255,255,255,0.1)"}`,
                        backgroundColor: on ? `${m.color}15` : "transparent",
                        color: on ? m.color : "rgb(107,114,128)",
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: on ? m.color : "rgb(75,85,99)", flexShrink: 0 }} />
                      {m.name}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "7px",
                  padding: "9px 18px", borderRadius: "10px", fontSize: "14px",
                  fontWeight: 600, fontFamily: "var(--font-outfit)", border: "none",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  backgroundColor: canSubmit ? "rgb(145,75,241)" : "rgb(50,51,52)",
                  color: canSubmit ? "rgb(255,255,255)" : "rgb(75,85,99)",
                  boxShadow: canSubmit ? "0 0 20px rgba(145,75,241,0.35)" : "none",
                  transition: "all 0.15s", flexShrink: 0,
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
                Run
              </button>
            </div>
          </div>

          {/* Suggestion chips */}
          <div className="w-full">
            <p className="text-xs uppercase tracking-wider font-semibold mb-3 text-center" style={{ color: "rgb(55,65,75)" }}>
              Try a sample query
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setQuery(s)}
                  className="transition-all hover:opacity-80"
                  style={{
                    padding: "7px 14px", borderRadius: "99px", fontSize: "13px",
                    fontFamily: "var(--font-outfit)",
                    backgroundColor: "rgb(39,40,41)", color: "rgb(107,114,128)",
                    border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {savedBrand ? (
            <p className="text-xs text-center" style={{ color: "rgb(55,65,75)" }}>
              Brand pre-filled from your{" "}
              <Link href="/dashboard/settings" style={{ color: "rgb(145,75,241)", textDecoration: "none" }}>Settings</Link>.
            </p>
          ) : (
            <p className="text-xs text-center" style={{ color: "rgb(55,65,75)" }}>
              Save your brand in{" "}
              <Link href="/dashboard/settings" style={{ color: "rgb(145,75,241)", textDecoration: "none" }}>Settings</Link>{" "}
              to pre-fill it every time.
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ── STREAMING / DONE: results view ── */
  return (
    <div className="space-y-6 pb-12" style={{ fontFamily: "var(--font-outfit)" }}>
      {/* Mini header showing what's being scanned */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 pb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "rgb(107,114,128)" }}>
            {phase === "done" ? "Diagnostic Complete" : "Running Diagnostic…"}
          </p>
          <h2 className="font-bold text-lg" style={{ color: "rgb(255,255,255)" }}>
            &ldquo;{activeQuery}&rdquo;
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "rgb(107,114,128)" }}>
            Brand: <span style={{ color: "rgb(192,132,252)", fontWeight: 600 }}>{activeBrand}</span>
          </p>
        </div>
        {phase === "done" && (
          <button
            onClick={resetToIdle}
            style={{
              padding: "8px 16px", borderRadius: "10px", fontSize: "13px",
              backgroundColor: "rgb(39,40,41)", color: "rgb(156,163,175)",
              border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
              fontFamily: "var(--font-outfit)",
            }}
          >
            ← New Diagnostic
          </button>
        )}
      </div>

      {/* Platform message bubble */}
      {message && (
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 flex items-center justify-center overflow-hidden"
            style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgb(145,75,241)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "rgb(145,75,241)" }}>AEOlytics</p>
            <div
              className={phase === "streaming" ? "animate-pulse" : ""}
              style={{
                padding: "10px 14px",
                backgroundColor: "rgb(39,40,41)",
                borderRadius: "0 12px 12px 12px",
                border: "1px solid rgba(255,255,255,0.06)",
                maxWidth: "600px",
              }}
            >
              <p style={{ color: "rgb(217,217,217)", fontSize: "14px", lineHeight: 1.6 }}>{message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Fatal error */}
      {fatalError && (
        <div
          style={{
            padding: "12px 16px", borderRadius: "12px", fontSize: "14px",
            backgroundColor: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "rgb(239,68,68)",
          }}
        >
          Error: {fatalError}
        </div>
      )}

      {/* Horizontal scrollable model cards */}
      {(arrived.length > 0 || pending.length > 0) && (
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(107,114,128)" }}>
            Model Responses
            {arrived.length > 0 && (
              <span style={{ color: "rgb(145,75,241)", marginLeft: "8px" }}>
                — brand <span style={{ backgroundColor: "rgba(145,75,241,0.2)", color: "rgb(192,132,252)", borderRadius: "3px", padding: "0 3px" }}>{activeBrand}</span> is highlighted
              </span>
            )}
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              overflowX: "auto",
              paddingBottom: "8px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(145,75,241,0.3) transparent",
            }}
          >
            {arrived.map((engine) => (
              <ModelCard
                key={engine.engine}
                engine={engine}
                brand={activeBrand}
                errorMsg={errors[engine.engine]}
              />
            ))}
            {pending.map((id) => (
              <PendingCard key={id} modelId={id} />
            ))}
          </div>
        </div>
      )}

      {/* Final report card */}
      {phase === "done" && scoreData && (
        <ReportCard
          scoreData={scoreData}
          scanId={scanId}
          brand={activeBrand}
          query={activeQuery}
          onNewScan={resetToIdle}
        />
      )}
    </div>
  );
}
