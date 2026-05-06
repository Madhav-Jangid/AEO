"use client";

import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[rgb(16,17,18)] text-slate-200 font-sans">
      <main>
        <div className="w-full p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
