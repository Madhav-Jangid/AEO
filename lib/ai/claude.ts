import type { AIProvider, ProviderInput, ProviderOutput } from "@/lib/ai/provider";
import { fallbackOutput } from "@/lib/ai/provider";

export const claudeProvider: AIProvider = {
  name: "claude",
  async run(input: ProviderInput): Promise<ProviderOutput> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return fallbackOutput("claude", input);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 700,
          messages: [{ role: "user", content: input.query }],
        }),
      });

      if (!res.ok) return fallbackOutput("claude", input);
      const data = (await res.json()) as { content?: Array<{ text?: string }> };
      const text = data.content?.[0]?.text?.trim();
      if (!text) return fallbackOutput("claude", input);
      return { text, usedFallback: false };
    } catch {
      return fallbackOutput("claude", input);
    }
  },
};
