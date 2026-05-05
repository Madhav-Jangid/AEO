import type { AIProvider, ProviderInput, ProviderOutput } from "@/lib/ai/provider";

export const geminiProvider: AIProvider = {
  name: "gemini",
  async run(input: ProviderInput): Promise<ProviderOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY");
    }

    const prompt = `You are a shopping answer engine. User query: ${input.query}. Product: ${input.productName}. Description: ${input.productDescription}. Give a concise recommendation mentioning alternatives.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!res.ok) {
      throw new Error(`Gemini failed ${res.status}`);
    }

    const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error("Gemini empty response");
    }

    return { text, usedFallback: false };
  },
};
