import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/user-context";
import { getMetaConnectionHealth, type MetaConnectionHealth } from "@/lib/meta/health";
import type { MetaConnectionStatus } from "@/types/database";

export type ConnectedMetaAdAccountRow = {
  id: string;
  meta_ad_account_id: string;
  meta_ad_account_name: string;
  account_status: string | null;
  currency: string | null;
  timezone_name: string | null;
  connection_status: MetaConnectionStatus;
  is_selected: boolean;
  created_at: string;
};

export type AdAccountsPageData = {
  organizationId: string | null;
  organizationName: string;
  metaConfigured: boolean;
  orgMetaStatus: MetaConnectionStatus | null;
  health: MetaConnectionHealth | null;
  accounts: ConnectedMetaAdAccountRow[];
  canConnect: boolean;
};

const ACCOUNT_COLUMNS =
  "id, meta_ad_account_id, meta_ad_account_name, account_status, currency, timezone_name, connection_status, is_selected, created_at";

export async function getAdAccountsPageData(metaConfigured: boolean): Promise<AdAccountsPageData> {
  const ctx = await getDashboardUserContext();
  const organization = ctx.organization;
  const organizationId = organization?.id ?? null;

  if (!organizationId) {
    return {
      organizationId: null,
      organizationName: "Your workspace",
      metaConfigured,
      orgMetaStatus: null,
      health: null,
      accounts: [],
      canConnect: false,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let canConnect = false;
  if (user) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    canConnect = ["owner", "admin"].includes(membership?.role ?? "");
  }

  const { data: accounts, error } = await supabase
    .from("connected_meta_ad_accounts")
    .select(ACCOUNT_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("connection_status", "connected")
    .order("meta_ad_account_name", { ascending: true });

  if (error) {
    console.error("[connected_meta_ad_accounts]", error.message);
  }

  const accountRows = (accounts ?? []) as ConnectedMetaAdAccountRow[];
  const connectedAccountCount = accountRows.filter(
    (row) => row.connection_status === "connected",
  ).length;

  const health = await getMetaConnectionHealth(supabase, organizationId, connectedAccountCount);

  return {
    organizationId,
    organizationName: organization!.name,
    metaConfigured,
    orgMetaStatus: organization!.meta_connection_status,
    health,
    accounts: accountRows,
    canConnect,
  };
}
