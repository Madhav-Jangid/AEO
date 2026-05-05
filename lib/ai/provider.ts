import type { ProviderName } from "@/lib/types";

export interface ProviderOutput {
  text: string;
  usedFallback: boolean;
}

export interface ProviderInput {
  query: string;
  productName: string;
  productDescription: string;
}

export interface AIProvider {
  name: ProviderName;
  run(input: ProviderInput): Promise<ProviderOutput>;
}

function makeFallback(model: ProviderName, input: ProviderInput): string {
  if (model === "gemini") {
    return `For ${input.query}, shoppers usually pick products with explicit quality proof and clear outcomes. ${input.productName} can improve mentions with stronger keyword alignment.`;
  }
  if (model === "gpt") {
    return `When buyers search ${input.query}, recommendations often prioritize trusted listings with concrete benefits. ${input.productName} appears relevant but may be outranked by clearer competitor messaging.`;
  }
  return `For ${input.query}, answer engines tend to cite listings with strong social proof and precise use-case signals. ${input.productName} should sharpen differentiators to rank higher.`;
}

export function fallbackOutput(model: ProviderName, input: ProviderInput): ProviderOutput {
  return { text: makeFallback(model, input), usedFallback: true };
}

export async function withTimeout<T>(fn: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await fn;
  } finally {
    clearTimeout(timeout);
  }
}
