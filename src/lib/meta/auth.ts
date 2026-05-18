import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/user-context";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MetaConnectAuthContext = {
  supabase: SupabaseClient;
  userId: string;
  organizationId: string;
};

export type MetaConnectAuthResult =
  | { ok: true; ctx: MetaConnectAuthContext }
  | { ok: false; reason: "unauthorized" | "forbidden" | "no_organization" };

export async function requireMetaConnectAuth(): Promise<MetaConnectAuthResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "unauthorized" };
  }

  const dashboardCtx = await getDashboardUserContext();
  const organizationId = dashboardCtx.profile?.default_organization_id;

  if (!organizationId || !dashboardCtx.organization) {
    return { ok: false, reason: "no_organization" };
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const role = membership?.role as string | undefined;
  if (!role || !["owner", "admin"].includes(role)) {
    return { ok: false, reason: "forbidden" };
  }

  return {
    ok: true,
    ctx: {
      supabase,
      userId: user.id,
      organizationId,
    },
  };
}
