import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recommendations",
};

export default function RecommendationRedirectPage() {
  redirect("/dashboard/insights");
}
