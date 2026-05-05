"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

/* ─── Icons ─── */
const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.636 5.636l2.121 2.121m8.485 8.485 2.121 2.121M5.636 18.364l2.121-2.121m8.485-8.485 2.121-2.121" />
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
  </svg>
);
const GearIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" />
  </svg>
);
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const NAV = [
  { label: "Dashboard", href: "/dashboard", icon: <GridIcon /> },
  { label: "Run Diagnostic", href: "/dashboard/run", icon: <SparkleIcon /> },
  { label: "History", href: "/dashboard/history", icon: <ClockIcon /> },
  { label: "Settings", href: "/dashboard/settings", icon: <GearIcon /> },
];

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        style={{
          width: "260px",
          backgroundColor: "rgb(16,17,18)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
            <div
              className="flex items-center justify-center overflow-hidden shrink-0"
              style={{ width: "34px", height: "34px", borderRadius: "9px" }}
            >
              <Image
                src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
                alt="AEOlytics"
                width={34}
                height={34}
                style={{ objectFit: "contain", borderRadius: "9px" }}
                unoptimized
              />
            </div>
            <span className="font-semibold text-base" style={{ color: "rgb(255,255,255)", fontFamily: "var(--font-outfit)" }}>
              AEOlytics
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: "rgb(107,114,128)" }}
          >
            <XIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{
                  backgroundColor: active ? "rgba(145,75,241,0.12)" : "transparent",
                  color: active ? "rgb(192,132,252)" : "rgb(156,163,175)",
                  fontFamily: "var(--font-outfit)",
                  fontWeight: active ? 600 : 400,
                  fontSize: "14px",
                  border: active ? "1px solid rgba(145,75,241,0.2)" : "1px solid transparent",
                }}
              >
                <span
                  className="shrink-0 transition-colors"
                  style={{ color: active ? "rgb(192,132,252)" : "rgb(107,114,128)" }}
                >
                  {item.icon}
                </span>
                {item.label}
                {item.label === "Run Diagnostic" && (
                  <span
                    className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: "rgba(145,75,241,0.2)", color: "rgb(192,132,252)" }}
                  >
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ color: "rgb(107,114,128)", fontFamily: "var(--font-outfit)", fontSize: "14px" }}
          >
            <HomeIcon />
            Back to Home
          </Link>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "rgb(16,17,18)", fontFamily: "var(--font-outfit), Outfit, sans-serif" }}
    >
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgb(16,17,18)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: "rgb(217,217,217)", backgroundColor: "rgb(39,40,41)" }}
          >
            <MenuIcon />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div
              className="overflow-hidden shrink-0"
              style={{ width: "28px", height: "28px", borderRadius: "7px" }}
            >
              <Image
                src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
                alt="AEOlytics"
                width={28}
                height={28}
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
            <span className="font-semibold text-sm" style={{ color: "rgb(255,255,255)" }}>AEOlytics</span>
          </Link>
          <div style={{ width: "36px" }} />
        </div>

        <main className="flex-1 p-5 md:p-7 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
