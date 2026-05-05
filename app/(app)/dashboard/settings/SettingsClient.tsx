"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#151719] p-6">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-neutral-400">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-white/10 bg-[#101112] px-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-400/60 ${className}`}
    />
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
      data: {
        full_name: name,
        brand_name: brand,
        brand_url: url,
      },
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
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#221536] via-[#181623] to-[#101112] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-purple-300/80">Settings</p>
        <h1 className="mt-1 text-2xl font-semibold text-white md:text-3xl">Account and brand preferences</h1>
        <p className="mt-2 text-sm text-neutral-300">Keep your diagnostic defaults and profile details up to date.</p>
      </section>

      <Card title="Brand Profile" subtitle="Auto-filled in diagnostics">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Brand Name</label>
            <Input value={brand} onChange={(event) => setBrand(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Website URL</label>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} />
          </div>
        </div>
      </Card>

      <Card title="Profile">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Display Name</label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-300">Email</label>
            <Input value={initialEmail} disabled className="opacity-70" />
          </div>
        </div>
      </Card>

      <Card title="Notifications">
        <div className="space-y-4">
          {[
            ["reports", "Report ready alerts"],
            ["digest", "Weekly digest"],
            ["competitors", "Competitor alerts"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-neutral-300">{label}</span>
              <Toggle
                value={notifications[key as keyof typeof notifications]}
                onChange={(value) => setNotifications((prev) => ({ ...prev, [key]: value }))}
              />
            </div>
          ))}
        </div>
      </Card>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-[#914bf1] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>

        <button onClick={logout} className="text-sm text-red-400 transition hover:opacity-80">
          Sign out
        </button>
      </section>
    </div>
  );
}

