"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AVAILABLE_MODELS, getEngineMeta } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";

/* â”€â”€â”€ Platform message templates â”€â”€â”€ */
const TEMPLATES = [
  (q: string, n: number) => `Scanning "${q}" across ${n} AI engine${n !== 1 ? "s" : ""} to check your brand's visibilityâ€¦`,
  (q: string) => `Querying multiple AI systems with your customer's exact search. Looking for your brand among the recommendations for "${q}"â€¦`,
  (_q: string) => `Analyzing how leading AI shopping assistants respond to your customer's query in real timeâ€¦`,
  (q: string) => `Running "${q}" through AI engines simultaneously. We'll highlight every mention of your brand as responses arrive.`,
];
function platformMsg(query: string, count: number) {
  return TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)](query, count);
}

/* â”€â”€â”€ Brand highlight â”€â”€â”€ */
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

/* â”€â”€â”€ Model response card (fixed width for horizontal scroll) â”€â”€â”€ */
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
                {engine.mentioned ? "Mentioned" : "Not found"}
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

/* â”€â”€â”€ Pending spinner card â”€â”€â”€ */
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
          Queryingâ€¦
        </p>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Final report card â”€â”€â”€ */
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
          <span style={{ margin: "0 8px", opacity: 0.3 }}>Â·</span>
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
                  x{c.timesMentioned}
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
            View Full Report
          </Link>
        ) : (
          <span style={{ color: "rgb(107,114,128)", fontSize: "13px" }}>
            âš  Report not saved â€” log in to save results
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
          New Diagnostic
        </button>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Suggestions â”€â”€â”€ */
const SUGGESTIONS = [
  "best protein powder for muscle gain",
  "top rated magnesium supplement for sleep",
  "best budget mechanical keyboard under $50",
  "most recommended pre-workout supplement",
  "best noise cancelling headphones 2024",
];

/* â”€â”€â”€ Main component â”€â”€â”€ */
interface RunClientProps {
  userId: string;
  savedBrand: string;
  userName: string;
}


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Layout Wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-5xl">{children}</div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ SAME HELPERS (unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
// keep your TEMPLATES, Highlighted, ModelCard, PendingCard, ReportCard EXACTLY SAME
// (no need to touch logic)

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

interface RunClientProps {
  userId: string;
  savedBrand: string;
  userName: string;
}

export function RunClient({ userId, savedBrand, userName }: RunClientProps) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState(savedBrand);

  const [selectedModels, setSelectedModels] = useState(
    AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id)
  );

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
        ? prev.length > 1
          ? prev.filter((m) => m !== id)
          : prev
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
    setMessage("Running AI visibility scan...");
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
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;

          const parsed = JSON.parse(event.slice(6));

          if (parsed.type === "engine") {
            setArrived((p) => [...p, parsed.data]);
            setPending((p) => p.filter((m) => m !== parsed.data.engine));
          }

          if (parsed.type === "complete") {
            setScoreData(parsed.scoreData);
            setScanId(parsed.scanId ?? null);
            setPhase("done");
          }
        }
      }
    } catch (err: unknown) {
      setFatalError(err instanceof Error ? err.message : "Unexpected scan error");
      setPhase("done");
    }
  }

  const firstName = userName.split(" ")[0] || "there";
  const canSubmit = query.trim() && brand.trim();

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ IDLE UI â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  if (phase === "idle") {
    return (
      <Container>
        <div className="min-h-[70vh] flex flex-col justify-center gap-8">

          {/* Header */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#221536] via-[#181623] to-[#101112] px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white">
              Hello, {firstName}👋
            </h1>
            <p className="text-gray-400 mt-2">
              What would your customers search for?
            </p>
          </div>

          {/* Input Card */}
          <div className="bg-[#272829] border border-white/10 rounded-2xl p-5 space-y-5">

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Customer query..."
              className="w-full rounded-xl border border-white/10 bg-[#101112] px-4 py-3 text-white outline-none resize-none focus:border-purple-400/60"
            />

            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Your brand"
              className="w-full rounded-xl border border-white/10 bg-[#101112] px-4 py-3 text-white outline-none focus:border-purple-400/60"
            />

            {/* Models */}
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_MODELS.map((m) => {
                const on = selectedModels.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleModel(m.id)}
                    className={`px-3 py-1 rounded-full text-xs border ${on
                      ? "border-purple-500 text-purple-400"
                      : "border-white/10 text-gray-500"
                      }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-5 py-2 rounded-xl bg-[#914bf1] text-white disabled:opacity-40"
              >
                Run Diagnostic
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="text-xs text-center text-gray-500">
            {savedBrand
              ? "Brand auto-filled from settings"
              : "Set your brand in Settings for autofill"}
          </p>
        </div>
      </Container>
    );
  }

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€ RESULTS UI â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

  return (
    <Container>
      <div className="space-y-6 pb-12">

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {activeQuery}
            </h2>
            <p className="text-sm text-gray-400">
              Brand: <span className="text-purple-400">{activeBrand}</span>
            </p>
          </div>

          {phase === "done" && (
            <button
              onClick={resetToIdle}
              className="text-sm text-gray-400 border px-3 py-1 rounded-md"
            >
              New Scan
            </button>
          )}
        </div>

        {/* Responses */}
        <div className="overflow-x-auto flex gap-4 pb-2">
          {arrived.map((e) => (
            <ModelCard key={e.engine} engine={e} brand={activeBrand} />
          ))}
          {pending.map((id) => (
            <PendingCard key={id} modelId={id} />
          ))}
        </div>

        {/* Report */}
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
    </Container>
  );
}

