import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/tickets";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin).replace(/\/$/, "");
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/tickets";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(safeNext, siteUrl));
}
