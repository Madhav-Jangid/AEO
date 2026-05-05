import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) redirect("/login");

  const user = data.user;
  const meta = user.user_metadata ?? {};

  const name =
    meta.full_name ||
    meta.name ||
    user.email?.split("@")[0] ||
    "";

  return (
    <div className="max-w-3xl mx-auto w-full">
      <SettingsClient
        initialName={name}
        initialEmail={user.email ?? ""}
        initialBrandName={meta.brand_name ?? ""}
        initialBrandUrl={meta.brand_url ?? ""}
      />
    </div>
  );
}