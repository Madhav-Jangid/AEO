"use client";

import Link from "next/link";

/* ─────────────────────────────────────────
   BUTTON COMPONENTS
───────────────────────────────────────── */
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
}

export function PrimaryButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { padding: "8px 16px", fontSize: "14px" };
      case "lg":
        return { padding: "14px 28px", fontSize: "18px" };
      default:
        return { padding: "10px 20px", fontSize: "16px" };
    }
  };

  const buttonContent = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: disabled ? "rgb(107, 114, 128)" : "rgb(145, 75, 241)",
        color: "rgb(255,255,255)",
        ...getSizeStyles(),
        borderRadius: "8px",
        fontFamily: "var(--font-outfit)",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </button>
  );

  if (href && href !== "#") {
    return (
      <Link href={href} style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}

export function SecondaryButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  size = "md",
  fullWidth = false,
  variant = "secondary",
  className = "",
}: ButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { padding: "8px 16px", fontSize: "14px" };
      case "lg":
        return { padding: "14px 28px", fontSize: "18px" };
      default:
        return { padding: "10px 20px", fontSize: "16px" };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          backgroundColor: "transparent",
          color: "rgb(239,68,68)",
          border: "1px solid rgb(239,68,68)",
        };
      default:
        return {
          backgroundColor: "transparent",
          color: "rgb(217,217,217)",
          border: "1px solid rgb(75, 85, 99)",
        };
    }
  };

  const buttonContent = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        borderRadius: "8px",
        fontFamily: "var(--font-outfit)",
        cursor: disabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </button>
  );

  if (href && href !== "#") {
    return (
      <Link href={href} style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}

export function OutlineButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  size = "md",
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return { padding: "8px 16px", fontSize: "14px" };
      case "lg":
        return { padding: "14px 28px", fontSize: "18px" };
      default:
        return { padding: "10px 20px", fontSize: "16px" };
    }
  };

  const buttonContent = (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{
        backgroundColor: "transparent",
        color: "rgb(145,75,241)",
        border: "1px solid rgb(145,75,241)",
        ...getSizeStyles(),
        borderRadius: "8px",
        fontFamily: "var(--font-outfit)",
        cursor: disabled ? "not-allowed" : "pointer",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {children}
    </button>
  );

  if (href && href !== "#") {
    return (
      <Link href={href} style={{ textDecoration: "none", display: fullWidth ? "block" : "inline-block" }}>
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}
