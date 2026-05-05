import { callGroq } from "./groq";
import { callGpt } from "./gpt";
import { callGemini } from "./gemini";
import { callClaude } from "./claude";
import { getModelById } from "@/lib/config/models";

export async function callModel(modelId: string, query: string): Promise<string> {
  const config = getModelById(modelId);
  if (!config) throw new Error(`Unknown model: ${modelId}`);
  switch (config.provider) {
    case "groq": return callGroq(query, config.model);
    case "gemini": return callGemini(query, config.model);
    case "openai": return callGpt(query, config.model);
    case "anthropic": return callClaude(query, config.model);
    default: throw new Error(`No handler for provider: ${config.provider}`);
  }
}
