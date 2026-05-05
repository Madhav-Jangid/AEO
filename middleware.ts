import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

/**
 * Route classification helpers
 */
const PUBLIC_ROUTES = new Set(["/", "/about", "/pricing", "/blog"]);
const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.has(pathname) || pathname.startsWith("/auth/");
}

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.has(pathname) || pathname.startsWith("/blog/");
}

/**
 * Safely build a redirect URL, falling back to the request origin
 * to prevent open-redirect attacks.
 */
function safeRedirect(destination: string, request: NextRequest): URL {
  const origin = request.nextUrl.origin;
  try {
    const url = new URL(destination, origin);
    // Ensure the redirect stays on the same origin
    if (url.origin !== origin) {
      return new URL("/dashboard", origin);
    }
    return url;
  } catch {
    return new URL("/dashboard", origin);
  }
}

/**
 * Validate a `next` query-param so we never redirect to an external URL
 * or a non-dashboard route after login.
 */
function getSafeNext(request: NextRequest): string | null {
  const next = request.nextUrl.searchParams.get("next");
  if (!next) return null;

  try {
    // `next` must be a relative path (no host) and must start with /dashboard
    const decoded = decodeURIComponent(next);
    if (decoded.startsWith("/dashboard") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    // malformed — ignore
  }
  return null;
}

export async function middleware(request: NextRequest) {
  // Normalize pathname: strip trailing slashes, default to "/"
  const rawPath = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  let session = null;
  let response = NextResponse.next();

  try {
    const client = createClient(request);
    response = client.response;

    // Use getSession() for lightweight reads; validate on sensitive routes below
    const { data, error } = await client.supabase.auth.getSession();
    if (!error) session = data.session;
  } catch (err) {
    // Supabase is unavailable — fail open for public routes, fail closed for protected ones
    console.error("[middleware] Supabase error:", err);

    if (isDashboardRoute(rawPath)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", rawPath);
      loginUrl.searchParams.set("error", "service_unavailable");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const isLoggedIn = !!session?.user;

  /* ─────────────────────────────────────────────
     1. UNAUTHENTICATED
     ───────────────────────────────────────────── */
  if (!isLoggedIn) {
    // Protect all /dashboard/* routes
    if (isDashboardRoute(rawPath)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", rawPath);
      return NextResponse.redirect(loginUrl);
    }

    // Everything else (public pages, auth pages, API routes) — allow through
    return response;
  }

  /* ─────────────────────────────────────────────
     2. AUTHENTICATED
     ───────────────────────────────────────────── */

  // Redirect away from auth pages (login, signup, etc.)
  if (isAuthRoute(rawPath)) {
    const next = getSafeNext(request);
    return NextResponse.redirect(safeRedirect(next ?? "/dashboard", request));
  }

  // Redirect the bare homepage to the dashboard
  if (rawPath === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // For dashboard and all other routes, attach user context headers
  // so server components can read identity without another DB round-trip
  response.headers.set("x-user-id", session!.user.id);
  response.headers.set("x-user-email", session!.user.email ?? "");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimizer)
     *  - favicon.ico
     *  - /api/*        (API routes handle their own auth)
     *  - Common static file extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf|map)$).*)",
  ],
};