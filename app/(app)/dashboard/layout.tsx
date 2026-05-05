"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

const NAV = [
  { label: "Overview", href: "/dashboard" },
  { label: "Run Diagnostic", href: "/dashboard/run" },
  { label: "History", href: "/dashboard/history" },
  { label: "Settings", href: "/dashboard/settings" },
];

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[260px] border-r border-white/10 bg-[#111315]/95 backdrop-blur-xl transition-transform duration-300 lg:static lg:z-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <Image
              src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
              alt="AEOlytics"
              width={30}
              height={30}
              className="rounded-md"
              unoptimized
            />
            <span className="text-sm font-semibold tracking-wide text-white">AEOlytics</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <XIcon />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-white text-black"
                    : "text-neutral-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pt-2">
          <Link
            href="/"
            onClick={onClose}
            className="block rounded-xl border border-white/10 px-3 py-2.5 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
          >
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
    <div className="min-h-screen bg-[#101112] text-white" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#101112]/90 px-4 backdrop-blur lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-neutral-200 transition hover:bg-white/10 lg:hidden"
            >
              <MenuIcon />
              Menu
            </button>

            <p className="hidden text-sm text-neutral-400 md:block">AI Visibility Dashboard</p>

            <Link
              href="/dashboard/run"
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black transition hover:opacity-90"
            >
              New Scan
            </Link>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

