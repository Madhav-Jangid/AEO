"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function NavBar() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(Boolean(data.user)));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#101112]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="https://framerusercontent.com/images/cLhE0zz9KoEfqjG2JcfNsvEDpA0.png"
            alt="AEOlytics"
            width={30}
            height={30}
            className="h-auto rounded-md"
            loading="eager"
            unoptimized
          />
          <span className="text-sm font-semibold tracking-wide text-white">AEOlytics</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="#how" className="rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white">
            How it works
          </Link>
          <Link
            href={authed ? "/dashboard" : "/login"}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:opacity-90"
          >
            {authed ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </div>
    </header>
  );
}

function SectionCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#151719] p-5">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-neutral-300">{body}</p>
    </article>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#101112] text-white">
      <NavBar />

      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8 md:px-6 md:py-10">
        <section className="rounded-3xl border border-white/10 bg-linear-to-br from-[#211633] via-[#171a24] to-[#101112] p-7 md:p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-200/80">MVP</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Understand how your brand appears in AI answers
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-neutral-300 md:text-base">
            AEOlytics helps you check mention frequency, position, and response tone across major AI models.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dashboard/run" className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black hover:opacity-90">
              Run free diagnostic
            </Link>
            <Link href="/signup" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10">
              Create account
            </Link>
          </div>
          <p className="mt-4 text-xs text-neutral-500">Results can vary by model, query wording, and time.</p>
        </section>

        <section id="how" className="grid gap-4 md:grid-cols-3">
          <SectionCard
            title="1. Enter a real customer query"
            body="Use natural language someone might search before buying."
          />
          <SectionCard
            title="2. Compare model responses"
            body="We run your query across selected models using the same input."
          />
          <SectionCard
            title="3. Review your report"
            body="See visibility, mentions, and practical recommendations."
          />
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#151719] p-6 md:p-7">
          <h2 className="text-lg font-semibold text-white">What this tool does and does not do</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-emerald-300">What it does</p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                <li>Shows where your brand appears in AI answers.</li>
                <li>Compares response behavior across models.</li>
                <li>Highlights competitor mention patterns.</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-300">What it does not do</p>
              <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                <li>It does not guarantee rankings or sales outcomes.</li>
                <li>It does not control third-party model behavior.</li>
                <li>It is a decision aid, not a full strategy replacement.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#151719] p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Simple pricing for MVP workflows</h2>
              <p className="mt-1 text-sm text-neutral-300">Start free, then upgrade when you need more scans and tracking.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/signup" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90">
                Start free
              </Link>
              <Link href="/dashboard" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
