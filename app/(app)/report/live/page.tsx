import { Suspense } from "react";
import { LiveReport } from "./LiveReport";

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
