"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ─── Icons ─── */
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const TagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const GlobeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ─── Shared input style ─── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgb(16,17,18)",
  color: "rgb(255,255,255)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px",
  padding: "10px 14px",
  fontFamily: "var(--font-outfit)",
  fontSize: "14px",
  outline: "none",
};

/* ─── Card wrapper ─── */
function Card({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div
      className="p-6"
      style={{ backgroundColor: "rgb(39,40,41)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="mb-6">
        <h3 className="font-semibold text-base" style={{ color: "rgb(255,255,255)" }}>{title}</h3>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "rgb(107,114,128)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* ─── Save button ─── */
function SaveButton({ onClick, saving, saved }: { onClick: () => void; saving: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="inline-flex items-center gap-2 font-semibold transition-all hover:opacity-90"
      style={{
        backgroundColor: saved ? "rgba(34,197,94,0.15)" : "rgb(145,75,241)",
        color: saved ? "rgb(34,197,94)" : "rgb(255,255,255)",
        border: saved ? "1px solid rgba(34,197,94,0.3)" : "none",
        padding: "9px 20px",
        borderRadius: "10px",
        fontSize: "14px",
        cursor: saving ? "wait" : "pointer",
      }}
    >
      {saved ? <><CheckIcon /> Saved!</> : saving ? "Saving…" : "Save Changes"}
    </button>
  );
}

/* ─── Toggle ─── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0"
      style={{ backgroundColor: on ? "rgb(145,75,241)" : "rgb(55,65,81)" }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(24px)" : "translateX(4px)" }}
      />
    </button>
  );
}

/* ─── Props ─── */
export interface SettingsClientProps {
  initialName: string;
  initialEmail: string;
  initialBrandName: string;
  initialBrandUrl: string;
}

export function SettingsClient({ initialName, initialEmail, initialBrandName, initialBrandUrl }: SettingsClientProps) {
  /* Brand profile state */
  const [brandName, setBrandName] = useState(initialBrandName);
  const [brandUrl, setBrandUrl] = useState(initialBrandUrl);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandSaved, setBrandSaved] = useState(false);

  /* Profile state */
  const [displayName, setDisplayName] = useState(initialName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  /* Notifications */
  const [notifications, setNotifications] = useState({
    emailReports: true,
    weeklyDigest: false,
    competitorAlerts: true,
  });

  const avatarInitial = (initialName || initialEmail || "?").charAt(0).toUpperCase();

  async function saveBrandProfile() {
    setBrandSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { brand_name: brandName.trim(), brand_url: brandUrl.trim() },
    });
    setBrandSaving(false);
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2500);
  }

  async function saveProfile() {
    setProfileSaving(true);
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { full_name: displayName.trim() },
    });
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="space-y-5 max-w-2xl" style={{ fontFamily: "var(--font-outfit)" }}>
      {/* Header */}
      <div className="pb-2">
        <h1 className="text-2xl font-bold" style={{ color: "rgb(255,255,255)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "rgb(107,114,128)" }}>
          Manage your brand profile and account preferences
        </p>
      </div>

      {/* ── Brand Profile (most important — goes first) ── */}
      <Card title="Brand Profile" subtitle="Saved brand auto-fills the Run Diagnostic form">
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "rgb(217,217,217)" }}>
              <TagIcon /> Brand / Product Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => { setBrandName(e.target.value); setBrandSaved(false); }}
              placeholder='e.g. "LiveConscious" or "MagTech Pro"'
              style={inputStyle}
            />
            <p className="text-xs mt-1.5" style={{ color: "rgb(107,114,128)" }}>
              The exact name AI systems should mention when recommending your product.
            </p>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "rgb(217,217,217)" }}>
              <GlobeIcon /> Website / Product URL
            </label>
            <input
              type="url"
              value={brandUrl}
              onChange={(e) => { setBrandUrl(e.target.value); setBrandSaved(false); }}
              placeholder="https://yourproduct.com"
              style={inputStyle}
            />
          </div>
          <SaveButton onClick={saveBrandProfile} saving={brandSaving} saved={brandSaved} />
        </div>
      </Card>

      {/* ── Profile Information ── */}
      <Card title="Profile Information">
        <div className="space-y-5">
          {/* Avatar row */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
              style={{ backgroundColor: "rgba(145,75,241,0.2)", color: "rgb(192,132,252)", border: "2px solid rgba(145,75,241,0.3)" }}
            >
              {avatarInitial}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "rgb(255,255,255)" }}>{initialName || "—"}</p>
              <p className="text-sm" style={{ color: "rgb(107,114,128)" }}>{initialEmail}</p>
            </div>
          </div>

          {/* Name field */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium mb-2" style={{ color: "rgb(217,217,217)" }}>
              <UserIcon /> Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setProfileSaved(false); }}
              style={inputStyle}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(217,217,217)" }}>
              Email Address
            </label>
            <input
              type="email"
              value={initialEmail}
              readOnly
              style={{ ...inputStyle, color: "rgb(107,114,128)", cursor: "default" }}
            />
            <p className="text-xs mt-1.5" style={{ color: "rgb(75,85,99)" }}>
              Email cannot be changed here.
            </p>
          </div>

          <SaveButton onClick={saveProfile} saving={profileSaving} saved={profileSaved} />
        </div>
      </Card>

      {/* ── Notifications ── */}
      <Card title="Notifications">
        <div className="space-y-5">
          {(
            [
              { key: "emailReports" as const, label: "Email reports when ready", desc: "Get notified when your diagnostic reports are complete" },
              { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of your AI visibility trends" },
              { key: "competitorAlerts" as const, label: "Competitor alerts", desc: "Notify when competitors gain significant AI visibility" },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: "rgb(217,217,217)" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgb(107,114,128)" }}>{desc}</p>
              </div>
              <Toggle on={notifications[key]} onChange={(v) => setNotifications((n) => ({ ...n, [key]: v }))} />
            </div>
          ))}
        </div>
      </Card>

      {/* ── Danger zone ── */}
      <div
        className="p-6"
        style={{
          backgroundColor: "rgb(39,40,41)",
          borderRadius: "20px",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <h3 className="font-semibold text-base mb-1" style={{ color: "rgb(255,255,255)" }}>Sign Out</h3>
        <p className="text-sm mb-4" style={{ color: "rgb(107,114,128)" }}>
          You&apos;ll be redirected to the login page.
        </p>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            color: "rgb(239,68,68)",
            padding: "9px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            border: "1px solid rgba(239,68,68,0.25)",
            cursor: "pointer",
          }}
        >
          <LogoutIcon />
          Sign out
        </button>
      </div>
    </div>
  );
}
