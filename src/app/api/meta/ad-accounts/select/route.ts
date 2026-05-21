import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { setSelectedMetaAdAccount } from "@/lib/meta/select-ad-account";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/user-context";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Please sign in." } },
      { status: 401 },
    );
  }

  const dashboardCtx = await getDashboardUserContext();
  const organizationId = dashboardCtx.profile?.default_organization_id;

  if (!organizationId) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_ORGANIZATION", message: "No workspace found." } },
      { status: 400 },
    );
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!membership) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "You are not a member of this workspace." } },
      { status: 403 },
    );
  }

  let body: { accountId?: string };
  try {
    body = (await request.json()) as { accountId?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_REQUEST", message: "Invalid request body." } },
      { status: 400 },
    );
  }

  const accountId = body.accountId?.trim();
  if (!accountId) {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_REQUEST", message: "accountId is required." } },
      { status: 400 },
    );
  }

  const { data: account } = await supabase
    .from("connected_meta_ad_accounts")
    .select("id")
    .eq("id", accountId)
    .eq("organization_id", organizationId)
    .eq("connection_status", "connected")
    .maybeSingle();

  if (!account) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "AD_ACCOUNT_NOT_FOUND", message: "Ad account not found for this workspace." },
      },
      { status: 404 },
    );
  }

  const result = await setSelectedMetaAdAccount(supabase, accountId);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: { code: "SELECT_FAILED", message: result.message } },
      { status: 400 },
    );
  }

  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return NextResponse.json({ ok: true });
}
