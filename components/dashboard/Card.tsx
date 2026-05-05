"use client";

import { ReactNode } from "react";

/* ─────────────────────────────────────────
   CARD COMPONENT
───────────────────────────────────────── */
interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  title,
  subtitle,
  className = "",
  padding = "md",
  hover = false,
}: CardProps) {
  const getPaddingStyles = () => {
    switch (padding) {
      case "sm":
        return "p-4";
      case "lg":
        return "p-8";
      default:
        return "p-6";
    }
  };

  return (
    <div
      className={`${getPaddingStyles()} ${hover ? "transition-all hover:opacity-80" : ""} ${className}`}
      style={{
        backgroundColor: "rgb(39,40,41)",
        borderRadius: "20px",
      }}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-lg font-medium" style={{ color: "rgb(255,255,255)" }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: "rgb(217,217,217)" }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   STAT CARD COMPONENT
───────────────────────────────────────── */
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  description,
  className = "",
}: StatCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(34,197,94)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
          </svg>
        );
      case "down":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
          </svg>
        );
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-500" />;
    }
  };

  return (
    <div
      className={`p-4 text-center ${className}`}
      style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "16px" }}
    >
      {icon && <div className="flex justify-center mb-3">{icon}</div>}
      
      <div className="text-2xl font-bold mb-1" style={{ color: "rgb(255,255,255)" }}>
        {value}
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="text-sm" style={{ color: "rgb(217,217,217)" }}>
          {title}
        </span>
        {trend && trendValue && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className="text-sm" style={{ color: "rgb(217,217,217)" }}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      
      {description && (
        <p className="text-sm" style={{ color: "rgb(217,217,217)" }}>
          {description}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   INSIGHT CARD COMPONENT
───────────────────────────────────────── */
interface InsightCardProps {
  type: "warning" | "opportunity" | "recommendation" | "positive" | "neutral";
  title: string;
  description: string;
  priority?: "high" | "medium" | "low";
  action?: string;
  className?: string;
}

export function InsightCard({
  type,
  title,
  description,
  priority,
  action,
  className = "",
}: InsightCardProps) {
  const getInsightStyle = () => {
    switch (type) {
      case "warning":
        return { bg: "rgba(251,191,36,0.2)", color: "rgb(251,191,36)" };
      case "opportunity":
        return { bg: "rgba(59,130,246,0.2)", color: "rgb(59,130,246)" };
      case "recommendation":
        return { bg: "rgba(145,75,241,0.2)", color: "rgb(145,75,241)" };
      case "positive":
        return { bg: "rgba(34,197,94,0.2)", color: "rgb(34,197,94)" };
      default:
        return { bg: "rgba(107,114,128,0.2)", color: "rgb(107,114,128)" };
    }
  };

  const getPriorityStyle = () => {
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

  const insightStyle = getInsightStyle();

  return (
    <div className={`p-4 rounded-lg ${className}`} style={{ backgroundColor: "rgb(16,17,18)" }}>
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-2 rounded-full mt-2 shrink-0"
          style={{ backgroundColor: insightStyle.color }}
        />
        <div className="flex-1 space-y-3">
          <div>
            <h4 
              className="font-medium"
              style={{ color: insightStyle.color }}
            >
              {title}
            </h4>
            <p className="text-sm mt-2" style={{ color: "rgb(217,217,217)" }}>
              {description}
            </p>
          </div>
          
          {action && (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: "rgb(156,163,175)" }}>
                Recommended Action
              </p>
              <p className="text-sm" style={{ color: "rgb(145,75,241)" }}>
                {action}
              </p>
            </div>
          )}
          
          {priority && (
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: getPriorityStyle().bg,
                  color: getPriorityStyle().color,
                  textTransform: "uppercase"
                }}
              >
                {priority}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
