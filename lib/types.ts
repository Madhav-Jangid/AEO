/* eslint-disable @typescript-eslint/no-explicit-any */
// ─── Legacy AEO Scout types (kept for backward compat) ───────────────────────
export type PlanType = "free" | "premium";
export type StorePlatform = "amazon" | "flipkart" | "meesho";
export type ProviderName = "gemini" | "gpt" | "claude";

export interface AppUser {
  id: string;
  email: string;
  plan: PlanType;
  onboarding_complete: boolean;
  created_at: string;
}

export interface ProductPreview {
  name: string;
  image: string;
}

// ─── AEO Diagnostic Tool types ───────────────────────────────────────────────

/** Open string so any model id ("llama3", "mixtral", "gemini", legacy "gpt"/"claude") works */
export type Engine = string;
export type Grade = "A" | "B" | "C" | "D" | "F";
export type Sentiment = "positive" | "neutral" | "negative";

export interface EngineAnalysis {
  engine: Engine;
  response: string;
  isFallback: boolean;
  mentioned: boolean;
  position: number | null;
  sentiment: Sentiment | null;
  competitors: string[];
}

export interface CompetitorRow {
  brand: string;
  /** Dynamic map of engineId → mentioned (new format) */
  mentionedBy?: Record<string, boolean>;
  timesMentioned: number;
  avgPosition: number | null;
  /** Legacy fields kept for backward compat with old scan records */
  mentionedByGpt?: boolean;
  mentionedByClaude?: boolean;
  mentionedByGemini?: boolean;
}

export interface ScoreData {
  totalScore: number;
  grade: Grade;
  mentionScore: number;
  positionScore: number;
  sentimentScore: number;
  mentionCount: number;
  engines: EngineAnalysis[];
  competitors: CompetitorRow[];
  insights?: InsightCard[];
}

export interface InsightCard {
  title: string;
  description: string;
}

export interface Scan {
  id: string;
  user_id: string | null;
  query: string;
  brand_name: string;
  gpt_response: string | null;
  claude_response: string | null;
  gemini_response: string | null;
  score_data: ScoreData | null;
  created_at: string;
}

export interface ScanListItem {
  id: string;
  query: string;
  brand_name: string;
  total_score: number;
  created_at: string;
}

export interface AnalysisResult {
  query: string;
  brand: string;
  results: EngineAnalysis[];
  score_data: ScoreData;
  // Additional properties for ProductDetailClient
  modelResults?: Array<{
    model: string;
    response: string;
    mentionDetected: boolean;
    mentionPosition?: number;
  }>;
  score?: number;
  mentions?: number;
  totalModels?: number;
  insights?: string[];
}

export interface ProductDetailPayload {
  product: {
    id: string;
    name: string;
    image?: string;
    platform?: string;
    lastAnalyzed?: string;
    freeLimitReached?: boolean;
    metadata?: any;
  };
  analysesToday: number;
  latestAnalysis?: AnalysisResult;
}


export type Cookie = {
  name: string;
  value: string;
  options?: Record<string, any>;
};