export async function callClaude(query: string, model: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.ANTROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing");

  const prompt = `A shopper is asking: "${query}". As an AI shopping assistant, what are your top recommendations? Be specific with product and brand names. List 5-7 recommended products or brands, numbered, with a brief explanation for each.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: Array<{ text?: string }> };
  const text = data.content?.[0]?.text?.trim();
  if (!text) throw new Error("Claude returned empty response");
  return text;
}
