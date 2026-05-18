import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserWorkspace } from "@/lib/supabase/user-context";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await ensureUserWorkspace();
      const url = new URL(next, origin);
      url.searchParams.set("verified", "1");
      return NextResponse.redirect(url.toString());
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
