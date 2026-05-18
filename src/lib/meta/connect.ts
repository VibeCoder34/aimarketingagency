import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import type { MetaEnvConfig } from "@/lib/meta/env";
import {
  displayAccountId,
  fetchMetaAdAccounts,
  fetchMetaMe,
  formatAccountStatus,
  resolveMetaAdAccountId,
} from "@/lib/meta/graph-client";
import { encryptMetaToken } from "@/lib/meta/token-crypto";
import { resolveTokenExpiresAt } from "@/lib/meta/token-lifetime";

const META_SCOPES = ["ads_read"];

export type MetaConnectResult = {
  accountsConnected: number;
  businessConnectionId: string;
};

export async function persistMetaConnection(
  config: MetaEnvConfig,
  auth: MetaConnectAuthContext,
  accessToken: string,
  expiresInSeconds?: number,
): Promise<MetaConnectResult> {
  const { supabase, userId, organizationId } = auth;

  const [me, adAccounts] = await Promise.all([
    fetchMetaMe(config, accessToken),
    fetchMetaAdAccounts(config, accessToken),
  ]);

  if (adAccounts.length === 0) {
    throw new Error("NO_AD_ACCOUNTS");
  }

  const tokenExpiresAt = resolveTokenExpiresAt(expiresInSeconds);
  const encryptedToken = encryptMetaToken(accessToken, config.tokenEncryptionKey);
  const metaBusinessId = me.id;
  const metaBusinessName = me.name?.trim() || "Meta Ads";

  const { count: priorConnectionCount } = await supabase
    .from("connected_meta_businesses")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);

  const hadPreviousConnection = (priorConnectionCount ?? 0) > 0;

  const { data: existingBusiness } = await supabase
    .from("connected_meta_businesses")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("meta_business_id", metaBusinessId)
    .maybeSingle();

  let businessConnectionId: string;

  if (existingBusiness?.id) {
    const { data: updated, error: updateError } = await supabase
      .from("connected_meta_businesses")
      .update({
        access_token_encrypted: encryptedToken,
        token_expires_at: tokenExpiresAt,
        scopes: META_SCOPES,
        connection_status: "connected",
        connected_by: userId,
        meta_business_name: metaBusinessName,
        last_synced_at: new Date().toISOString(),
        last_error_message: null,
      })
      .eq("id", existingBusiness.id)
      .select("id")
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update Meta business connection: ${updateError?.message}`);
    }
    businessConnectionId = updated.id;
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from("connected_meta_businesses")
      .insert({
        organization_id: organizationId,
        connected_by: userId,
        meta_business_id: metaBusinessId,
        meta_business_name: metaBusinessName,
        access_token_encrypted: encryptedToken,
        token_expires_at: tokenExpiresAt,
        scopes: META_SCOPES,
        connection_status: "connected",
        last_synced_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Failed to save Meta business connection: ${insertError?.message}`);
    }
    businessConnectionId = inserted.id;
  }

  const { data: existingAccounts } = await supabase
    .from("connected_meta_ad_accounts")
    .select("meta_ad_account_id, is_selected")
    .eq("organization_id", organizationId);

  const hasSelected = (existingAccounts ?? []).some((row) => row.is_selected);

  for (let i = 0; i < adAccounts.length; i++) {
    const account = adAccounts[i]!;
    await upsertAdAccount(supabase, {
      organizationId,
      businessConnectionId,
      account,
      selectFirst: !hasSelected && i === 0,
    });
  }

  const { error: orgError } = await supabase
    .from("organizations")
    .update({ meta_connection_status: "connected" })
    .eq("id", organizationId);

  if (orgError) {
    throw new Error(`Failed to update organization Meta status: ${orgError.message}`);
  }

  const auditAction = hadPreviousConnection ? "meta.reconnected" : "meta.connected";

  const { error: auditError } = await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    action: auditAction,
    entity_type: "connected_meta_business",
    entity_id: businessConnectionId,
    risk_level: "medium",
    metadata: {
      meta_business_id: metaBusinessId,
      ad_accounts_count: adAccounts.length,
      scopes: META_SCOPES,
      account_ids: adAccounts.map((a) => displayAccountId(a)),
      token_expires_at: tokenExpiresAt,
    },
  });

  if (auditError) {
    console.error("[meta.connected audit]", auditError.message);
  }

  return {
    accountsConnected: adAccounts.length,
    businessConnectionId,
  };
}

async function upsertAdAccount(
  supabase: MetaConnectAuthContext["supabase"],
  params: {
    organizationId: string;
    businessConnectionId: string;
    account: import("@/lib/meta/graph-client").MetaAdAccountNode;
    selectFirst: boolean;
  },
): Promise<void> {
  const { organizationId, businessConnectionId, account, selectFirst } = params;
  const metaAdAccountId = resolveMetaAdAccountId(account);
  const metaAdAccountName = account.name?.trim() || `Ad account ${displayAccountId(account)}`;

  const row = {
    organization_id: organizationId,
    meta_business_connection_id: businessConnectionId,
    meta_ad_account_id: metaAdAccountId,
    meta_ad_account_name: metaAdAccountName,
    account_status: formatAccountStatus(account.account_status),
    currency: account.currency ?? null,
    timezone_name: account.timezone_name ?? null,
    connection_status: "connected" as const,
    is_selected: selectFirst,
    permissions: ["ads_read"],
  };

  const { data: existing } = await supabase
    .from("connected_meta_ad_accounts")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("meta_ad_account_id", metaAdAccountId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("connected_meta_ad_accounts")
      .update({
        meta_business_connection_id: businessConnectionId,
        meta_ad_account_name: row.meta_ad_account_name,
        account_status: row.account_status,
        currency: row.currency,
        timezone_name: row.timezone_name,
        connection_status: row.connection_status,
        permissions: row.permissions,
        ...(selectFirst ? { is_selected: true } : {}),
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(`Failed to update ad account ${metaAdAccountId}: ${error.message}`);
    }
    return;
  }

  const { error } = await supabase.from("connected_meta_ad_accounts").insert(row);
  if (error) {
    throw new Error(`Failed to insert ad account ${metaAdAccountId}: ${error.message}`);
  }
}
