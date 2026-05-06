"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input } from "@/components/ui/primitives";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-neutral-300">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex h-6 w-11 items-center rounded-full p-1 transition ${value ? "bg-[#914bf1]" : "bg-neutral-600"}`}
    >
      <span className={`h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export function SettingsClient({
  initialName,
  initialEmail,
  initialBrandName,
  initialBrandUrl,
}: {
  initialName: string;
  initialEmail: string;
  initialBrandName: string;
  initialBrandUrl: string;
}) {
  const supabase = createClient();
  const [name, setName] = useState(initialName);
  const [brand, setBrand] = useState(initialBrandName);
  const [url, setUrl] = useState(initialBrandUrl);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    reports: true,
    digest: false,
    competitors: true,
  });

  async function save() {
    setLoading(true);
    await supabase.auth.updateUser({
      data: { full_name: name, brand_name: brand, brand_url: url },
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto w-full max-w-[980px] space-y-5">
      <Card className="border-white/15 bg-gradient-to-br from-[#1e1530] via-[#141922] to-[#0f1113] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">Settings</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl">Profile and workspace defaults</h1>
        <p className="mt-2 text-sm text-neutral-300">Keep your account and brand details current so each diagnostic starts with the right context.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-white">Brand profile</p>
          <p className="mt-1 text-xs text-neutral-400">Used as default brand context in new runs.</p>
          <div className="mt-4 space-y-4">
            <Row label="Brand name">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
            </Row>
            <Row label="Website URL">
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
            </Row>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-sm font-medium text-white">Account</p>
          <p className="mt-1 text-xs text-neutral-400">Personal profile and sign-in details.</p>
          <div className="mt-4 space-y-4">
            <Row label="Display name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Row>
            <Row label="Email">
              <Input value={initialEmail} disabled className="opacity-70" />
            </Row>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-sm font-medium text-white">Notifications</p>
        <p className="mt-1 text-xs text-neutral-400">Choose which updates you want to receive.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            ["reports", "Report ready"],
            ["digest", "Weekly summary"],
            ["competitors", "Competitor mentions"],
          ].map(([key, label]) => (
            <div key={key} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-200">{label}</p>
                <Toggle
                  value={notifications[key as keyof typeof notifications]}
                  onChange={(value) => setNotifications((prev) => ({ ...prev, [key]: value }))}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button onClick={save} disabled={loading}>{loading ? "Saving..." : saved ? "Saved" : "Save changes"}</Button>
          <Button variant="secondary" href="/dashboard">Back to overview</Button>
        </div>
        <Button variant="danger" onClick={logout}>Sign out</Button>
      </div>
    </div>
  );
}
