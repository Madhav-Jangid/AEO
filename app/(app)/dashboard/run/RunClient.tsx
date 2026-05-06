"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Send, Bot, ChevronDown, Search, Mic } from "lucide-react";
import { AVAILABLE_MODELS } from "@/lib/config/models";
import type { EngineAnalysis, ScoreData } from "@/lib/types";
import { Card, Textarea } from "@/components/ui/primitives";

interface RunClientProps {
  userId: string;
  savedBrand: string;
  userName: string;
}

type Phase = "idle" | "streaming" | "done";

const SUGGESTIONS = [
  "best magnesium supplement for sleep",
  "best budget running shoes",
  "most trusted probiotic brand",
  "best protein powder for women",
];

const MIN_QUERY_LENGTH = 6;
const MAX_QUERY_LENGTH = 600;
const MAX_LINES = 5;

export function RunClient({ userId, savedBrand, userName }: RunClientProps) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [brand] = useState(savedBrand);
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedModels, setSelectedModels] = useState(AVAILABLE_MODELS.filter((m) => m.defaultEnabled).map((m) => m.id));
  const [showModels, setShowModels] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  const [arrived, setArrived] = useState<EngineAnalysis[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const started = useRef(false);

  const trimmed = query.trim();
  const lineCount = query.split("\n").length;
  const validTextSize = trimmed.length >= MIN_QUERY_LENGTH && trimmed.length <= MAX_QUERY_LENGTH;
  const canSend = Boolean(brand) && phase !== "streaming" && validTextSize && lineCount <= MAX_LINES;

  const isEmptyState = phase === "idle" && !submittedQuery && arrived.length === 0 && !scoreData && !fatalError;

  const modelGroups = useMemo(() => {
    const filtered = AVAILABLE_MODELS.filter((m) => m.name.toLowerCase().includes(agentSearch.toLowerCase()));
    return [
      { title: "Recommended", items: filtered.filter((m) => m.defaultEnabled) },
      { title: "All Agents", items: filtered },
    ];
  }, [agentSearch]);

  async function runDiagnostic(prompt: string) {
    const q = prompt.trim();
    if (!q || !brand || selectedModels.length === 0) return;

    started.current = true;
    setSubmittedQuery(q);
    setPhase("streaming");
    setArrived([]);
    setPending([...selectedModels]);
    setScoreData(null);
    setScanId(null);
    setFatalError(null);

    try {
      const res = await fetch("/api/scan/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, brandName: brand, userId, selectedModels }),
      });

      if (!res.ok || !res.body) {
        setFatalError(`Request failed (${res.status}).`);
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
      setFatalError(err instanceof Error ? err.message : "Unexpected error while running scan.");
      setPhase("done");
    }
  }

  function toggleModel(id: string) {
    setSelectedModels((prev) => (prev.includes(id) ? (prev.length > 1 ? prev.filter((m) => m !== id) : prev) : [...prev, id]));
  }

  function onTextChange(next: string) {
    if (next.length > MAX_QUERY_LENGTH) return;
    if (next.split("\n").length > MAX_LINES) return;
    setQuery(next);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter") return;

    if (e.ctrlKey) {
      if (lineCount >= MAX_LINES) e.preventDefault();
      return;
    }

    e.preventDefault();
    if (canSend) void runDiagnostic(query);
  }

  const composer = (
    <div className="relative rounded-[28px] bg-[#171a1f]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
      {showModels ? (
        <div className="absolute bottom-[calc(100%+10px)] right-0 z-30 w-85 overflow-hidden rounded-2xl border border-white/12 bg-[#171a1f] shadow-2xl animate-[fadeIn_180ms_ease-out]">
          <div className="border-b border-white/8 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-2">
              <Search className="h-4 w-4 text-neutral-500" />
              <input value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)} placeholder="Search models" className="w-full bg-transparent text-sm text-white outline-none" />
            </div>
          </div>
          <div className="max-h-70 overflow-y-auto p-2">
            {modelGroups.map((group) => (
              <div key={group.title} className="mb-3">
                <p className="px-2 pb-1 text-xs uppercase tracking-[0.14em] text-neutral-500">{group.title}</p>
                <div className="space-y-1">
                  {group.items.map((m) => (
                    <button
                      key={`${group.title}-${m.id}`}
                      onClick={() => toggleModel(m.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition ${selectedModels.includes(m.id) ? "bg-purple-400/20 text-white" : "text-neutral-300 hover:bg-white/8"}`}
                    >
                      <span>{m.name}</span>
                      <span className="text-xs">{selectedModels.includes(m.id) ? "On" : "Off"}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <Textarea
          value={query}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          rows={1}
          placeholder="Ask anything..."
          className="min-h-10.5 max-h-40 flex-1 resize-none rounded-2xl border-transparent bg-white/2 focus:border-transparent"
        />

        <button
          type="button"
          onClick={() => setShowModels((v) => !v)}
          className="inline-flex h-10 items-center gap-1 rounded-full border border-white/12 bg-white/5 px-3 text-xs text-neutral-200 hover:bg-white/10"
        >
          Models <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/5 text-neutral-200 hover:bg-white/10"
          aria-label="Voice input"
          title="Voice input"
        >
          <Mic className="h-4 w-4" />
        </button>

        <button
          title="Send Query"
          type="button"
          onClick={() => runDiagnostic(query)}
          disabled={!canSend}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-2 text-[11px] text-neutral-500">
        Enter to send • Ctrl+Enter for new line • max {MAX_LINES} lines
      </p>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-215">
      <div className="relative flex min-h-[calc(100vh-9rem)] flex-col">
        <div className="mb-4">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-purple-200/80">Run</p>
          <h1 className="mt-2 text-center text-3xl font-semibold tracking-tight text-white">Hi {userName.split(" ")[0] || "there"}</h1>
          <p className="mt-1 text-center text-lg text-neutral-300">Where should we start?</p>
        </div>

        {isEmptyState ? (
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-visible">
            <Image
              src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
              alt=""
              fill
              className="pointer-events-none object-contain opacity-[0.3] blur-xl  "
              unoptimized
            />
            <div className="relative z-10 w-full max-w-190 px-2">
              <p className="mb-6 text-center text-base text-neutral-300">Try one of these prompts</p>
              <div className="mb-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => setQuery(s)} className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/8">
                    {s}
                  </button>
                ))}
              </div>
              {composer}
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[
                  "Create image",
                  "Explore fan zone",
                  "Write anything",
                  "Boost my day",
                  "Help me learn",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="rounded-full bg-white/5 px-4 py-2 text-sm text-neutral-300 transition hover:bg-white/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto pb-36">
              {submittedQuery ? <Message role="user">{submittedQuery}</Message> : null}

              {phase !== "idle" ? <Message role="assistant">Running diagnostic across selected agents.</Message> : null}

              {pending.length > 0 ? <Message role="assistant">Checking {pending.length} agent{pending.length > 1 ? "s" : ""}...</Message> : null}

              {arrived.map((e, i) => (
                <Card key={`${e.engine}-${i}`} className="p-4">
                  <p className="text-sm font-medium text-white">{e.engine.toUpperCase()}</p>
                  <p className="mt-1 text-sm text-neutral-300">
                    {e.isFallback ? "This agent failed to return a response." : e.mentioned ? `Mentioned${e.position ? ` at #${e.position}` : ""}.` : "Not mentioned."}
                  </p>
                  {e.response ? (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-neutral-400">View model response</summary>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-300">{e.response}</p>
                    </details>
                  ) : null}
                </Card>
              ))}

              {scoreData ? (
                <Card className="p-4">
                  <p className="text-sm font-medium text-white">Summary</p>
                  <p className="mt-1 text-sm text-neutral-300">Score {scoreData.totalScore} ({scoreData.grade}) with {scoreData.mentionCount}/{scoreData.engines.length} mentions.</p>
                  {scanId ? <a href={`/report/${scanId}`} className="mt-3 inline-block text-sm text-purple-200 underline underline-offset-4">Open full report</a> : null}
                </Card>
              ) : null}

              {fatalError ? <Message role="assistant">We could not complete this run: {fatalError}</Message> : null}
            </div>

            <div className="absolute bottom-0 left-0 right-0">{composer}</div>
          </>
        )}
      </div>
    </div>
  );
}

function Message({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-purple-400/18 px-4 py-3 text-sm text-purple-50">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-neutral-200">
        <Bot className="h-3.5 w-3.5" />
      </div>
      <div className="max-w-[80%] rounded-2xl bg-(--color-surface) px-4 py-3 text-sm text-neutral-200">{children}</div>
    </div>
  );
}
