import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function getSafeNext(rawNext: string | null): string | null {
  if (!rawNext) return null;
  try {
    const decoded = decodeURIComponent(rawNext);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) return decoded;
  } catch {
    return null;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${origin}${next ?? "/dashboard"}`);
}
