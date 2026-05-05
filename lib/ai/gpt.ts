import type { AIProvider, ProviderInput, ProviderOutput } from "@/lib/ai/provider";

export const gptProvider: AIProvider = {
  name: "gpt",
  async run(input: ProviderInput): Promise<ProviderOutput> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          { role: "system", content: "You are a concise shopping recommendation engine." },
          {
            role: "user",
            content: `User query: ${input.query}. Product: ${input.productName}. Description: ${input.productDescription}. Return one short recommendation with alternatives.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI failed ${response.status}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenAI empty response");
    }

    return { text, usedFallback: false };
  },
};
