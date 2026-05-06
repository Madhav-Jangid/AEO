import { Suspense } from "react";
import type { Metadata } from "next";
import { LiveReport } from "./LiveReport";

export const metadata: Metadata = {
  title: "Live Report",
};

export default function LiveReportPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            color: "rgb(217,217,217)",
            padding: "40px",
            fontFamily: "var(--font-outfit)",
          }}
        >
          Loading diagnostic…
        </div>
      }
    >
      <LiveReport />
    </Suspense>
  );
}
