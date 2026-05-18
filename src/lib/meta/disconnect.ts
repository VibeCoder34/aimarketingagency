import type { MetaConnectAuthContext } from "@/lib/meta/auth";

export async function disconnectMetaConnection(
  auth: MetaConnectAuthContext,
): Promise<void> {
  const { supabase, userId, organizationId } = auth;

  const { data: businesses } = await supabase
    .from("connected_meta_businesses")
    .select("id")
    .eq("organization_id", organizationId);

  const businessIds = (businesses ?? []).map((row) => row.id);

  if (businessIds.length > 0) {
    const { error: businessError } = await supabase
      .from("connected_meta_businesses")
      .update({
        access_token_encrypted: null,
        token_expires_at: null,
        connection_status: "disconnected",
        last_error_message: null,
      })
      .eq("organization_id", organizationId);

    if (businessError) {
      throw new Error(`Failed to disconnect Meta business: ${businessError.message}`);
    }
  }

  const { error: accountsError } = await supabase
    .from("connected_meta_ad_accounts")
    .update({ connection_status: "disconnected", is_selected: false })
    .eq("organization_id", organizationId);

  if (accountsError) {
    throw new Error(`Failed to disconnect Meta ad accounts: ${accountsError.message}`);
  }

  const { error: orgError } = await supabase
    .from("organizations")
    .update({ meta_connection_status: "disconnected" })
    .eq("id", organizationId);

  if (orgError) {
    throw new Error(`Failed to update organization Meta status: ${orgError.message}`);
  }

  const { error: auditError } = await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    actor_user_id: userId,
    action: "meta.disconnected",
    entity_type: "organization",
    entity_id: organizationId,
    risk_level: "medium",
    metadata: {
      business_connections_affected: businessIds.length,
    },
  });

  if (auditError) {
    console.error("[meta.disconnected audit]", auditError.message);
  }
}
