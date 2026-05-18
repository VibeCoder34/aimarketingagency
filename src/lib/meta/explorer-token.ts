import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import { getMetaEnvConfig, MetaConfigError } from "@/lib/meta/env";
import { decryptMetaToken } from "@/lib/meta/token-crypto";

export function normalizeActAdAccountId(adAccountId: string): string {
  const trimmed = adAccountId.trim();
  if (!trimmed) {
    throw new MetaExplorerError("INVALID_REQUEST", "Ad account id is required.");
  }
  return trimmed.startsWith("act_") ? trimmed : `act_${trimmed}`;
}

export async function assertAdAccountForOrganization(
  auth: MetaConnectAuthContext,
  adAccountId: string,
): Promise<string> {
  const normalized = normalizeActAdAccountId(adAccountId);

  const { data, error } = await auth.supabase
    .from("connected_meta_ad_accounts")
    .select("id")
    .eq("organization_id", auth.organizationId)
    .eq("meta_ad_account_id", normalized)
    .eq("connection_status", "connected")
    .maybeSingle();

  if (error) {
    console.error("[meta/explorer] ad account lookup:", error.message);
    throw new MetaExplorerError(
      "AD_ACCOUNT_NOT_FOUND",
      "Ad account not found for this organization.",
    );
  }

  if (!data) {
    throw new MetaExplorerError(
      "AD_ACCOUNT_NOT_FOUND",
      "Ad account not found for this organization.",
    );
  }

  return normalized;
}

export async function resolveMetaAccessToken(
  auth: MetaConnectAuthContext,
): Promise<string> {
  let config;
  try {
    config = getMetaEnvConfig();
  } catch (err) {
    const message = err instanceof MetaConfigError ? err.message : "Meta is not configured.";
    throw new MetaExplorerError("CONFIG_ERROR", message);
  }

  const { data: business, error } = await auth.supabase
    .from("connected_meta_businesses")
    .select("access_token_encrypted, token_expires_at, connection_status")
    .eq("organization_id", auth.organizationId)
    .not("access_token_encrypted", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[meta/explorer] business lookup:", error.message);
    throw new MetaExplorerError(
      "CONNECTION_NOT_FOUND",
      "Meta connection not found. Connect Meta Ads first.",
    );
  }

  if (!business?.access_token_encrypted) {
    throw new MetaExplorerError(
      "CONNECTION_NOT_FOUND",
      "Meta connection not found. Connect Meta Ads first.",
    );
  }

  if (business.connection_status === "disconnected") {
    throw new MetaExplorerError(
      "CONNECTION_NOT_FOUND",
      "Meta is disconnected. Reconnect to fetch data.",
    );
  }

  if (business.token_expires_at) {
    const expiresMs = new Date(business.token_expires_at).getTime();
    if (!Number.isNaN(expiresMs) && expiresMs <= Date.now()) {
      throw new MetaExplorerError(
        "TOKEN_EXPIRED",
        "Meta token has expired. Reconnect Meta Ads to continue.",
      );
    }
  }

  return decryptMetaToken(business.access_token_encrypted, config.tokenEncryptionKey);
}
