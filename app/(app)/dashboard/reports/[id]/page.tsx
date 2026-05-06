"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

/* ─────────────────────────────────────────
  ICONS
───────────────────────────────────────── */
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* ─────────────────────────────────────────
  BUTTON COMPONENTS
───────────────────────────────────────── */
function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 font-medium transition-all hover:opacity-80"
      style={{
        backgroundColor: "transparent",
        color: "rgb(217,217,217)",
        padding: "10px 20px",
        borderRadius: "8px",
        border: "1px solid rgb(75, 85, 99)",
        fontFamily: "var(--font-outfit)",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────
  REPORT HEADER
───────────────────────────────────────── */
function ReportHeader({
  reportData
}: {
  reportData: {
    query: string;
    brand: string;
    category: string;
    date: string;
    aeoScore: number;
    visibility: string;
  };
}) {
  const router = useRouter();

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("Download functionality would be implemented here");
  };

  const handleShare = () => {
    // In a real app, this would open a share dialog
    alert("Share functionality would be implemented here");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => router.push("/dashboard/history")}
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
          style={{ color: "rgb(217,217,217)" }}
        >
          <ArrowLeftIcon />
          History
        </button>
        <span style={{ color: "rgb(107,114,128)" }}>→</span>
        <span style={{ color: "rgb(145,75,241)" }}>Report Detail</span>
      </div>

      {/* Header Info */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "rgb(255,255,255)" }}>
              Diagnostic Report
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <CalendarIcon />
                <span style={{ color: "rgb(217,217,217)" }}>{reportData.date}</span>
              </div>
              <div
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{
                  backgroundColor: "rgba(145,75,241,0.2)",
                  color: "rgb(145,75,241)"
                }}
              >
                {reportData.category}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p style={{ color: "rgb(217,217,217)" }}>
              <span className="font-medium">Query:</span> &quot;{reportData.query}&quot;
            </p>
            <p style={{ color: "rgb(217,217,217)" }}>
              <span className="font-medium">Brand:</span> {reportData.brand}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div
              className="text-4xl font-bold"
              style={{
                color: reportData.aeoScore >= 70 ? "rgb(34,197,94)" :
                  reportData.aeoScore >= 40 ? "rgb(251,191,36)" :
                    "rgb(239,68,68)"
              }}
            >
              {reportData.aeoScore}
            </div>
            <p className="text-sm mt-1" style={{ color: "rgb(217,217,217)" }}>
              AEO Score
            </p>
          </div>

          <div className="text-center">
            <div
              className="px-3 py-1 text-lg font-medium rounded-full"
              style={{
                backgroundColor: reportData.visibility.includes("3/3") ? "rgba(34,197,94,0.2)" :
                  reportData.visibility.includes("2/3") ? "rgba(251,191,36,0.2)" :
                    "rgba(239,68,68,0.2)",
                color: reportData.visibility.includes("3/3") ? "rgb(34,197,94)" :
                  reportData.visibility.includes("2/3") ? "rgb(251,191,36)" :
                    "rgb(239,68,68)"
              }}
            >
              {reportData.visibility}
            </div>
            <p className="text-sm mt-1" style={{ color: "rgb(217,217,217)" }}>
              Visibility
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <SecondaryButton onClick={handleDownload}>
          <DownloadIcon />
          Download PDF
        </SecondaryButton>
        <SecondaryButton onClick={handleShare}>
          <ShareIcon />
          Share Report
        </SecondaryButton>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
  AI RESPONSES PANEL (REPORT VERSION)
───────────────────────────────────────── */
function ReportAIResponsesPanel() {
  const [activeTab, setActiveTab] = useState("gpt");

  const responses = {
    gpt: {
      name: "GPT-4o",
      response: `Based on your query about magnesium supplements for seniors, here are my top recommendations:

  1. **NutriPeak Magnesium Glycinate** - Highly bioavailable form, gentle on stomach
  2. **VitaCore Magnesium Complex** - Contains multiple forms for better absorption
  3. **PureBrand Magnesium Citrate** - Good for constipation relief in seniors

  Each of these products is specifically formulated for older adults with appropriate dosing and minimal side effects.`,
      mentions: ["NutriPeak"],
      confidence: "High",
    },
    claude: {
      name: "Claude 3.5",
      response: `For seniors looking for magnesium supplements, I'd recommend:

  • **VitaCore Magnesium Complex** - Comprehensive formula with vitamin D3
  • **HealthFirst Senior Magnesium** - Lower dose, easier to absorb
  • **NutriPeak Magnesium Glycinate** - Gentle formulation for sensitive stomachs

  These brands consistently rate well for quality and senior-specific formulations.`,
      mentions: ["VitaCore", "HealthFirst", "NutriPeak"],
      confidence: "High",
    },
    gemini: {
      name: "Gemini 1.5",
      response: `The best magnesium supplements for seniors typically include:

  1. **VitaCore Magnesium Complex** - Multi-form blend with co-factors
  2. **PureBrand Magnesium Citrate** - High absorption rate
  3. **AlphaVit Senior Formula** - Specifically designed for adults 65+

  Look for products that third-party test for purity and provide clear dosing instructions.`,
      mentions: ["VitaCore", "PureBrand", "AlphaVit"],
      confidence: "Medium",
    },
  };

  const currentResponse = responses[activeTab as keyof typeof responses];

  return (
    <div
      className="p-6"
      style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
    >
      <h3 className="text-lg font-medium mb-4" style={{ color: "rgb(255,255,255)" }}>
        🧠 AI Responses
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        {Object.entries(responses).map(([key, response]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 font-medium transition-all border-b-2 ${activeTab === key
              ? "text-purple-400 border-purple-400"
              : "text-gray-400 border-transparent hover:text-gray-300"
              }`}
            style={{
              color: activeTab === key ? "rgb(145,75,241)" : "rgb(156,163,175)",
              borderColor: activeTab === key ? "rgb(145,75,241)" : "transparent",
            }}
          >
            {response.name}
          </button>
        ))}
      </div>

      {/* Response Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: "rgb(217,217,217)" }}>
            Confidence: {currentResponse.confidence}
          </span>
          <span className="text-sm" style={{ color: "rgb(217,217,217)" }}>
            Response time: ~2.3s
          </span>
        </div>

        <div className="p-4 rounded-lg" style={{ backgroundColor: "rgb(16,17,18)" }}>
          <div className="whitespace-pre-line" style={{ color: "rgb(217,217,217)", lineHeight: "1.6" }}>
            {currentResponse.response}
          </div>
        </div>

        {/* Mentions */}
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: "rgb(217,217,217)" }}>
            Brand Mentions:
          </p>
          <div className="flex flex-wrap gap-2">
            {currentResponse.mentions.length > 0 ? (
              currentResponse.mentions.map((mention, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{
                    backgroundColor: "rgba(34,197,94,0.2)",
                    color: "rgb(34,197,94)"
                  }}
                >
                  {mention}
                </span>
              ))
            ) : (
              <span className="text-sm" style={{ color: "rgb(239,68,68)" }}>
                No brand mentions found
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
  DETAILED ANALYSIS
───────────────────────────────────────── */
function DetailedAnalysis() {
  const analysisData = [
    {
      metric: "Overall Visibility",
      value: "67%",
      description: "Found in 2 out of 3 AI models",
      trend: "up",
      details: "Improvement from previous scan where visibility was 33%",
    },
    {
      metric: "Average Ranking",
      value: "#2.5",
      description: "Average position across AI responses",
      trend: "up",
      details: "Ranked 2nd in GPT, 3rd in Claude, not found in Gemini",
    },
    {
      metric: "Sentiment Score",
      value: "8.2/10",
      description: "Positive sentiment when mentioned",
      trend: "neutral",
      details: "Described as 'gentle', 'bioavailable', and 'quality'",
    },
    {
      metric: "Competitor Density",
      value: "4.3",
      description: "Average competitors per response",
      trend: "down",
      details: "Lower than category average of 5.8 competitors",
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <span style={{ color: "rgb(34,197,94)" }}>↑</span>;
      case "down":
        return <span style={{ color: "rgb(239,68,68)" }}>↓</span>;
      default:
        return <span style={{ color: "rgb(156,163,175)" }}>→</span>;
    }
  };

  return (
    <div
      className="p-6"
      style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
    >
      <h3 className="text-lg font-medium mb-4" style={{ color: "rgb(255,255,255)" }}>
        📊 Detailed Analysis
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analysisData.map((item, index) => (
          <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: "rgb(16,17,18)" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: "rgb(217,217,217)" }}>
                  {item.metric}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: "rgb(255,255,255)" }}>
                    {item.value}
                  </span>
                  {getTrendIcon(item.trend)}
                </div>
              </div>
            </div>

            <p className="text-sm mb-2" style={{ color: "rgb(217,217,217)" }}>
              {item.description}
            </p>
            <p className="text-xs" style={{ color: "rgb(156,163,175)" }}>
              {item.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
  COMPETITOR ANALYSIS
───────────────────────────────────────── */
function CompetitorAnalysis() {
  const competitors = [
    {
      name: "VitaCore",
      frequency: 3,
      visibility: "100%",
      avgRank: 1.7,
      sentiment: "Positive",
      strength: "Comprehensive formulations"
    },
    {
      name: "NutriPeak",
      frequency: 2,
      visibility: "67%",
      avgRank: 2.5,
      sentiment: "Positive",
      strength: "Gentle on stomach"
    },
    {
      name: "PureBrand",
      frequency: 2,
      visibility: "67%",
      avgRank: 2.0,
      sentiment: "Neutral",
      strength: "High absorption"
    },
    {
      name: "HealthFirst",
      frequency: 1,
      visibility: "33%",
      avgRank: 3.0,
      sentiment: "Positive",
      strength: "Senior-specific"
    },
    {
      name: "AlphaVit",
      frequency: 1,
      visibility: "33%",
      avgRank: 3.0,
      sentiment: "Neutral",
      strength: "65+ formulation"
    },
  ];

  return (
    <div
      className="p-6"
      style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
    >
      <h3 className="text-lg font-medium mb-4" style={{ color: "rgb(255,255,255)" }}>
        🧠 Competitor Analysis
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th className="text-left p-3 font-medium" style={{ color: "rgb(217,217,217)" }}>
                Brand
              </th>
              <th className="text-left p-3 font-medium" style={{ color: "rgb(217,217,217)" }}>
                Visibility
              </th>
              <th className="text-left p-3 font-medium" style={{ color: "rgb(217,217,217)" }}>
                Avg Rank
              </th>
              <th className="text-left p-3 font-medium" style={{ color: "rgb(217,217,217)" }}>
                Sentiment
              </th>
              <th className="text-left p-3 font-medium" style={{ color: "rgb(217,217,217)" }}>
                Key Strength
              </th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: index < competitors.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none"
                }}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: "rgba(145,75,241,0.2)",
                        color: "rgb(145,75,241)",
                        minWidth: "20px",
                        textAlign: "center"
                      }}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`font-medium ${competitor.name === "NutriPeak" ? "text-purple-400" : ""}`}
                      style={{ color: competitor.name === "NutriPeak" ? "rgb(145,75,241)" : "rgb(255,255,255)" }}
                    >
                      {competitor.name}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: competitor.visibility === "100%" ? "rgba(34,197,94,0.2)" :
                        competitor.visibility === "67%" ? "rgba(251,191,36,0.2)" :
                          "rgba(239,68,68,0.2)",
                      color: competitor.visibility === "100%" ? "rgb(34,197,94)" :
                        competitor.visibility === "67%" ? "rgb(251,191,36)" :
                          "rgb(239,68,68)"
                    }}
                  >
                    {competitor.visibility}
                  </span>
                </td>
                <td className="p-3">
                  <span style={{ color: "rgb(255,255,255)" }}>
                    #{competitor.avgRank}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: competitor.sentiment === "Positive" ? "rgba(34,197,94,0.2)" : "rgba(156,163,175,0.2)",
                      color: competitor.sentiment === "Positive" ? "rgb(34,197,94)" : "rgb(156,163,175)"
                    }}
                  >
                    {competitor.sentiment}
                  </span>
                </td>
                <td className="p-3">
                  <span className="text-sm" style={{ color: "rgb(217,217,217)" }}>
                    {competitor.strength}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
  ACTIONABLE INSIGHTS
───────────────────────────────────────── */
function ActionableInsights() {
  const insights = [
    {
      priority: "high",
      title: "Improve Gemini Visibility",
      description: "Your brand was not mentioned in Gemini's response. Focus on technical specifications and third-party testing in your product descriptions.",
      action: "Add detailed technical specs and certifications to your product pages",
      impact: "High",
      effort: "Medium",
    },
    {
      priority: "medium",
      title: "Leverage Senior-Specific Positioning",
      description: "AI models preferentially recommend products that explicitly mention senior formulations.",
      action: "Update product descriptions to highlight senior-specific benefits and formulations",
      impact: "Medium",
      effort: "Low",
    },
    {
      priority: "medium",
      title: "Compete on Bioavailability",
      description: "Your 'gentle on stomach' messaging is working. Compete more strongly on absorption rates.",
      action: "Include specific bioavailability percentages and comparison data",
      impact: "Medium",
      effort: "Medium",
    },
    {
      priority: "low",
      title: "Monitor VitaCore Strategy",
      description: "VitaCore dominates with 100% visibility. Analyze their content strategy and positioning.",
      action: "Conduct competitive analysis on VitaCore's content and messaging",
      impact: "Low",
      effort: "High",
    },
  ];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "rgba(239,68,68,0.2)", color: "rgb(239,68,68)" };
      case "medium":
        return { bg: "rgba(251,191,36,0.2)", color: "rgb(251,191,36)" };
      case "low":
        return { bg: "rgba(156,163,175,0.2)", color: "rgb(156,163,175)" };
      default:
        return { bg: "rgba(107,114,128,0.2)", color: "rgb(107,114,128)" };
    }
  };

  const getImpactStyle = (impact: string) => {
    switch (impact) {
      case "High":
        return "rgb(34,197,94)";
      case "Medium":
        return "rgb(251,191,36)";
      case "Low":
        return "rgb(156,163,175)";
      default:
        return "rgb(107,114,128)";
    }
  };

  const getEffortStyle = (effort: string) => {
    switch (effort) {
      case "Low":
        return "rgb(34,197,94)";
      case "Medium":
        return "rgb(251,191,36)";
      case "High":
        return "rgb(239,68,68)";
      default:
        return "rgb(107,114,128)";
    }
  };

  return (
    <div
      className="p-6"
      style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px" }}
    >
      <h3 className="text-lg font-medium mb-4" style={{ color: "rgb(255,255,255)" }}>
        ⚡ Actionable Insights
      </h3>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const priorityStyle = getPriorityStyle(insight.priority);
          return (
            <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: "rgb(16,17,18)" }}>
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: priorityStyle.bg,
                      color: priorityStyle.color,
                      textTransform: "uppercase"
                    }}
                  >
                    {insight.priority}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <h4
                      className="font-medium text-lg"
                      style={{ color: "rgb(255,255,255)" }}
                    >
                      {insight.title}
                    </h4>
                    <p className="text-sm mt-1" style={{ color: "rgb(217,217,217)" }}>
                      {insight.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "rgb(156,163,175)" }}>
                        Recommended Action
                      </p>
                      <p className="text-sm" style={{ color: "rgb(145,75,241)" }}>
                        {insight.action}
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-xs font-medium mb-1" style={{ color: "rgb(156,163,175)" }}>
                          Impact
                        </p>
                        <span
                          className="text-sm font-medium"
                          style={{ color: getImpactStyle(insight.impact) }}
                        >
                          {insight.impact}
                        </span>
                      </div>

                      <div className="text-center">
                        <p className="text-xs font-medium mb-1" style={{ color: "rgb(156,163,175)" }}>
                          Effort
                        </p>
                        <span
                          className="text-sm font-medium"
                          style={{ color: getEffortStyle(insight.effort) }}
                        >
                          {insight.effort}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
  MOCK DATA
───────────────────────────────────────── */
const mockReportData = {
  "magnesium-seniors": {
    query: "best magnesium supplement for seniors",
    brand: "NutriPeak",
    category: "supplements",
    date: "Apr 28, 2025",
    aeoScore: 72,
    visibility: "2/3 AIs",
  },
  "sleep-aids": {
    query: "natural sleep aids for adults",
    brand: "NutriPeak",
    category: "supplements",
    date: "Apr 27, 2025",
    aeoScore: 65,
    visibility: "1/3 AIs",
  },
};

/* ─────────────────────────────────────────
  MAIN REPORT PAGE
───────────────────────────────────────── */
export default function ReportDetailPage() {
  const params = useParams();
  const reportId = params.id as string;

  const reportData = mockReportData[reportId as keyof typeof mockReportData];

  if (!reportData) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4" style={{ color: "rgb(255,255,255)" }}>
            Report Not Found
          </h1>
          <p className="mb-6" style={{ color: "rgb(217,217,217)" }}>
            The requested report could not be found.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: "rgb(145,75,241)",
              color: "rgb(255,255,255)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportHeader reportData={reportData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportAIResponsesPanel />
        <DetailedAnalysis />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompetitorAnalysis />
        <ActionableInsights />
      </div>
    </div>
  );
}
