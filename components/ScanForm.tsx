"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_MODELS } from "@/lib/config/models";

/* ─── Default selections: models where defaultEnabled = true ─── */
const DEFAULT_SELECTED = AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id);

export function ScanForm({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [brandName, setBrandName] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>(DEFAULT_SELECTED);
  const router = useRouter();

  function toggleModel(id: string) {
    setSelectedModels((prev) =>
      prev.includes(id)
        ? prev.length > 1
          ? prev.filter((m) => m !== id) // always keep at least one
          : prev
        : [...prev, id]
    );
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!query || !brandName || selectedModels.length === 0) return;
    const params = new URLSearchParams({
      q: query,
      b: brandName,
      m: selectedModels.join(","),
      u: userId,
    });
    router.push(`/report/live?${params.toString()}`);
  }

  /* ── Form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Query input */}
      <div className="space-y-1.5">
        <label
          htmlFor="query"
          className="block text-sm font-medium"
          style={{ color: "rgb(217,217,217)" }}
        >
          Customer Query
        </label>
        <input
          id="query"
          required
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "best magnesium supplement for seniors"'
          style={{
            width: "100%",
            backgroundColor: "rgb(16,17,18)",
            color: "rgb(255,255,255)",
            border: "1px solid rgb(75,85,99)",
            borderRadius: "8px",
            padding: "12px 16px",
            fontFamily: "var(--font-outfit)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <p className="text-xs" style={{ color: "rgb(107,114,128)" }}>
          The exact question a shopper would ask an AI.
        </p>
      </div>

      {/* Brand input */}
      <div className="space-y-1.5">
        <label
          htmlFor="brandName"
          className="block text-sm font-medium"
          style={{ color: "rgb(217,217,217)" }}
        >
          Your Brand / Product Name
        </label>
        <input
          id="brandName"
          required
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder='e.g. "LiveConscious"'
          style={{
            width: "100%",
            backgroundColor: "rgb(16,17,18)",
            color: "rgb(255,255,255)",
            border: "1px solid rgb(75,85,99)",
            borderRadius: "8px",
            padding: "12px 16px",
            fontFamily: "var(--font-outfit)",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <p className="text-xs" style={{ color: "rgb(107,114,128)" }}>
          We scan each AI response to detect if this brand is recommended.
        </p>
      </div>

      {/* ── Model selector ── */}
      <div className="space-y-2 pt-1">
        <p className="text-sm font-medium" style={{ color: "rgb(217,217,217)" }}>
          AI Models to Query
        </p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_MODELS.map((model) => {
            const on = selectedModels.includes(model.id);
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => toggleModel(model.id)}
                title={model.tagline}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 13px",
                  borderRadius: "99px",
                  fontSize: "13px",
                  fontFamily: "var(--font-outfit)",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: `1.5px solid ${on ? model.color : "rgb(75,85,99)"}`,
                  backgroundColor: on
                    ? `${model.color}18`   // ~10% opacity tint
                    : "transparent",
                  color: on ? model.color : "rgb(107,114,128)",
                  // prevent deselecting last model
                  opacity: !on && selectedModels.length === 0 ? 0.4 : 1,
                }}
              >
                {/* Indicator dot */}
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: on ? model.color : "rgb(107,114,128)",
                    flexShrink: 0,
                  }}
                />
                {model.name}
                {!model.defaultEnabled && (
                  <span
                    style={{
                      fontSize: "10px",
                      backgroundColor: "rgba(107,114,128,0.2)",
                      color: "rgb(107,114,128)",
                      padding: "1px 5px",
                      borderRadius: "4px",
                    }}
                  >
                    needs key
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs" style={{ color: "rgb(107,114,128)" }}>
          {selectedModels.length} model{selectedModels.length !== 1 ? "s" : ""} selected.
          Must keep at least one active.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!query || !brandName || selectedModels.length === 0}
          style={{
            backgroundColor:
              !query || !brandName || selectedModels.length === 0
                ? "rgb(75,85,99)"
                : "rgb(145,75,241)",
            color: "rgb(255,255,255)",
            padding: "12px 32px",
            borderRadius: "8px",
            fontFamily: "var(--font-outfit)",
            fontSize: "15px",
            fontWeight: 600,
            border: "none",
            cursor:
              !query || !brandName || selectedModels.length === 0
                ? "not-allowed"
                : "pointer",
            transition: "all 0.15s",
            boxShadow:
              !query || !brandName || selectedModels.length === 0
                ? "none"
                : "0 0 15px rgba(145,75,241,0.35)",
          }}
        >
          Run Diagnostic →
        </button>
      </div>
    </form>
  );
}
