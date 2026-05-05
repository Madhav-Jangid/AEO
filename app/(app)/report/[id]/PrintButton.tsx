"use client";

export function PrintButton() {
  return (
    <button
      style={{
        padding: "8px 16px",
        fontSize: "13px",
        fontFamily: "var(--font-outfit)",
        color: "rgb(217,217,217)",
        backgroundColor: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        cursor: "pointer",
      }}
      onClick={() => window.print()}
    >
      Download PDF
    </button>
  );
}
