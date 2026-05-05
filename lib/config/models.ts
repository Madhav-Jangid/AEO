export interface ModelConfig {
  id: string;
  name: string;
  tagline: string;
  provider: "groq" | "gemini" | "openai" | "anthropic";
  model: string;
  color: string;
  defaultEnabled: boolean;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "llama3",
    name: "Llama 3.3 70B",
    tagline: "Meta · Groq",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    color: "rgb(249,115,22)",
    defaultEnabled: true,
  },
  {
    id: "llama3-8b",
    name: "Llama 3.1 8B",
    tagline: "Meta · Groq",
    provider: "groq",
    model: "llama-3.1-8b-instant",
    color: "rgb(59,130,246)",
    defaultEnabled: true,
  },
  {
    id: "gemini",
    name: "Gemini 2.5 Flash",
    tagline: "Google DeepMind",
    provider: "gemini",
    model: "gemini-2.5-flash",
    color: "rgb(99,102,241)",
    defaultEnabled: false,
  },
  {
    id: "gpt",
    name: "GPT-4o",
    tagline: "OpenAI",
    provider: "openai",
    model: "gpt-4o-mini",
    color: "rgb(16,185,129)",
    defaultEnabled: false,
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet",
    tagline: "Anthropic",
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    color: "rgb(251,191,36)",
    defaultEnabled: false,
  },
];

export function getModelById(id: string): ModelConfig | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === id);
}

export function getEngineMeta(id: string): { name: string; color: string } {
  const cfg = AVAILABLE_MODELS.find((m) => m.id === id);
  if (cfg) return { name: cfg.name, color: cfg.color };
  const legacy: Record<string, { name: string; color: string }> = {
    gpt: { name: "GPT-4o", color: "rgb(16,185,129)" },
    claude: { name: "Claude 3.5", color: "rgb(251,191,36)" },
    gemini: { name: "Gemini 1.5 Pro", color: "rgb(99,102,241)" },
    mixtral: { name: "Mixtral 8x7B", color: "rgb(59,130,246)" },
  };
  return legacy[id] ?? { name: id, color: "rgb(156,163,175)" };
}
