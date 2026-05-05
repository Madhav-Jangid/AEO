const GROQ_BASE = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT =
  "You are a helpful AI shopping assistant. Always respond with a numbered list of specific product and brand recommendations.";

export async function callGroq(query: string, model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");

  const prompt = `A shopper is asking: "${query}". As an AI shopping assistant, what are your top recommendations? Be specific with product and brand names. List 5-7 recommended products or brands, numbered, with a brief explanation for each.`;

  const res = await fetch(GROQ_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API Error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Groq returned empty response");
  return text;
}
