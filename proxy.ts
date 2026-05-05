import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password", "/reset-password"]);

function isDashboardRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.has(pathname) || pathname.startsWith("/auth/");
}

function safeRedirect(destination: string, request: NextRequest): URL {
  const origin = request.nextUrl.origin;
  try {
    const url = new URL(destination, origin);
    if (url.origin !== origin) return new URL("/dashboard", origin);
    return url;
  } catch {
    return new URL("/dashboard", origin);
  }
}

function getSafeNext(request: NextRequest): string | null {
  const next = request.nextUrl.searchParams.get("next");
  if (!next) return null;
  try {
    const decoded = decodeURIComponent(next);
    if (decoded.startsWith("/dashboard") && !decoded.startsWith("//")) return decoded;
  } catch {
    // malformed
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const rawPath = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  let user: { id: string; email?: string } | null = null;
  let response = NextResponse.next();

  try {
    const client = createClient(request);
    response = client.response;
    const { data, error } = await client.supabase.auth.getUser();
    if (!error && data.user) user = data.user;
  } catch (err) {
    console.error("[middleware] Supabase error:", err);
    if (isDashboardRoute(rawPath)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", rawPath);
      loginUrl.searchParams.set("error", "service_unavailable");
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (!user) {
    if (isDashboardRoute(rawPath)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", rawPath);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (isAuthRoute(rawPath)) {
    const next = getSafeNext(request);
    return NextResponse.redirect(safeRedirect(next ?? "/dashboard", request));
  }

  response.headers.set("x-user-id", user.id);
  response.headers.set("x-user-email", user.email ?? "");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf|map)$).*)",
  ],
};
