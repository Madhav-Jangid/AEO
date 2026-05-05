"use client";

export function PrintButton() {
  return (
    <button
      style={{
        padding: "8px 16px",
        fontSize: "13px",
        fontFamily: "var(--font-outfit)",
        color: "rgb(238,228,255)",
        backgroundColor: "rgba(145,75,241,0.2)",
        border: "1px solid rgba(145,75,241,0.5)",
        borderRadius: "12px",
        cursor: "pointer",
      }}
      onClick={() => window.print()}
    >
      Download PDF
    </button>
  );
}

