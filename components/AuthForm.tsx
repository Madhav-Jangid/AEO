"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleOAuth(provider: "google" | "apple") {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="mt-2 text-base text-slate-400">
          {mode === "login"
            ? "Sign in to view your diagnostic reports."
            : "Start analyzing your AI visibility for free."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-800 px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          Continue with Google
        </button>
        
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-800 px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.02-.05-.01-.08-.02-.13-.02 0-1.19.533-2.35 1.258-3.14C13.75 1.99 15.034 1.34 16.03 1.34c.14 0 .28.02.335.03v.06zm4.84 15.65c-.882 2.68-2.618 5.6-5.118 5.6-.962 0-1.924-.62-3.13-.62-1.25 0-2.378.62-3.238.62-2.584 0-4.363-2.92-5.325-5.6C3.072 13.34 2.89 9.38 5.176 7.02c1.11-1.15 2.593-1.87 4.092-1.87 1.365 0 2.502.7 3.327.7.8 0 2.12-.76 3.655-.76 1.135 0 2.518.39 3.498 1.44-3.155 1.69-2.673 6.13.457 7.55v.06l-.01.01v-.07z" />
          </svg>
          Continue with Apple
        </button>
      </div>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink-0 px-4 text-sm text-slate-500">Or continue with email</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-3">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-[rgb(145,75,241)] focus:outline-none transition-colors"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 6 chars)"
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-[rgb(145,75,241)] focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[rgb(145,75,241)] hover:bg-[rgb(130,65,225)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(145,75,241,0.3)]"
        >
          {loading
            ? "Please wait…"
            : mode === "login"
            ? "Sign in"
            : "Create account"}
        </button>

        {error && (
          <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
