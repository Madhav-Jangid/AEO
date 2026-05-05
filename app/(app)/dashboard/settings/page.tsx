import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    redirect("/login");
  }

  const user = userData.user;
  const meta = user.user_metadata ?? {};

  const name = meta.full_name || meta.name || user.email?.split("@")[0] || "";
  const brandName = meta.brand_name ?? "";
  const brandUrl = meta.brand_url ?? "";

  return (
    <SettingsClient
      initialName={name}
      initialEmail={user.email ?? ""}
      initialBrandName={brandName}
      initialBrandUrl={brandUrl}
    />
  );
}
