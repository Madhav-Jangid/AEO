import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RunClient } from "./RunClient";

export default async function RunDiagnosticPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const user = userData.user;
  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "";
  const savedBrand = user.user_metadata?.brand_name ?? "";

  return (
    <RunClient
      userId={user.id}
      savedBrand={savedBrand}
      userName={userName}
    />
  );
}
