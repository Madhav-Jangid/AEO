import { NextResponse } from "next/server";
import { ensureAppUser, getDashboardPayload } from "@/lib/data";

export async function GET() {
  const appUser = await ensureAppUser();
  if (!appUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getDashboardPayload(appUser.id);
  return NextResponse.json(data);
}
