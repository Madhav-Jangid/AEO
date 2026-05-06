"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Play, History, Sparkles, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Image from "next/image";

const NAV_TOP = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Run Diagnostic", href: "/dashboard/run", icon: Play },
  { label: "Run History", href: "/dashboard/history", icon: History },
  { label: "Insights", href: "/dashboard/insights", icon: Sparkles },
] as const;

function Item({ href, label, collapsed, active, icon: Icon }: { href: string; label: string; collapsed: boolean; active: boolean; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center rounded-full transition-all duration-200 ${collapsed ? "h-11 w-11 justify-center" : "h-11 px-3"} ${active
        ? "bg-purple-400/20 text-white"
        : "text-neutral-300 hover:bg-white/8 hover:text-white"
        }`}
      title={collapsed ? label : undefined}
    >
      <span className="inline-flex w-5 items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <span
        className={`overflow-hidden text-sm transition-all duration-200 ${collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-35 opacity-100"}`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f1113] font-sans text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>
      <div className="flex min-h-screen w-full">
        <aside
          className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-white/10 bg-[#121417]/90 px-3 py-3 backdrop-blur-xl transition-[width] duration-300 ${collapsed ? "w-18.5" : "w-62.5"}`}
        >
          <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>

            {!collapsed ? (
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className="space-y-1.5">
            {NAV_TOP.map((item) => (
              <Item
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                active={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-2">
            <Item
              href="/dashboard/settings"
              label="Settings"
              icon={Settings}
              collapsed={collapsed}
              active={pathname.startsWith("/dashboard/settings")}
            />
          </div>
        </aside>

        <div className="relative z-10 min-w-0 flex-1">
          <header className="sticky top-0 z-20 h-14 border-b border-white/5 bg-[#0f1113]/80 backdrop-blur">
            <div className="flex h-full items-center px-5">
              <Link href="/dashboard" className={`flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
                <Image
                  src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
                  alt="AEOlytics"
                  width={26}
                  height={26}
                  className="rounded-md"
                  loading="eager"
                  unoptimized
                />
                {!collapsed ? <span className="text-sm font-semibold tracking-wide">AEOlytics</span> : null}
              </Link>            </div>
          </header>

          <main className="w-full px-4 py-5 md:px-6 md:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
