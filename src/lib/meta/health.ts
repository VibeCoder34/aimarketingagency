import type { SupabaseClient } from "@supabase/supabase-js";
import type { MetaConnectionStatus } from "@/types/database";
import { expiresSoonThresholdMs } from "@/lib/meta/token-lifetime";

export type MetaConnectionHealthState =
  | "connected"
  | "expires_soon"
  | "expired"
  | "disconnected"
  | "error";

export type MetaConnectionHealth = {
  state: MetaConnectionHealthState;
  tokenExpiresAt: string | null;
  connectedAccountCount: number;
  metaBusinessName: string | null;
  needsReconnect: boolean;
};

type BusinessRow = {
  connection_status: MetaConnectionStatus;
  token_expires_at: string | null;
  meta_business_name: string | null;
  access_token_encrypted: string | null;
};

function deriveHealthFromBusiness(business: BusinessRow | null): MetaConnectionHealthState {
  if (!business?.access_token_encrypted) {
    return "disconnected";
  }

  if (business.connection_status === "error") {
    return "error";
  }

  if (business.connection_status === "expired") {
    return "expired";
  }

  if (business.connection_status === "disconnected") {
    return "disconnected";
  }

  const expiresAt = business.token_expires_at;
  if (expiresAt) {
    const expiryMs = new Date(expiresAt).getTime();
    const now = Date.now();
    if (expiryMs <= now) {
      return "expired";
    }
    if (expiryMs <= now + expiresSoonThresholdMs()) {
      return "expires_soon";
    }
  }

  return "connected";
}

export async function getMetaConnectionHealth(
  supabase: SupabaseClient,
  organizationId: string,
  connectedAccountCount: number,
): Promise<MetaConnectionHealth> {
  const { data: businesses, error } = await supabase
    .from("connected_meta_businesses")
    .select(
      "connection_status, token_expires_at, meta_business_name, access_token_encrypted, updated_at",
    )
    .eq("organization_id", organizationId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[meta/health] connected_meta_businesses:", error.message);
    return {
      state: "error",
      tokenExpiresAt: null,
      connectedAccountCount,
      metaBusinessName: null,
      needsReconnect: true,
    };
  }

  const primary =
    (businesses ?? []).find((row) => row.access_token_encrypted) ?? businesses?.[0] ?? null;

  const state = deriveHealthFromBusiness(primary as BusinessRow | null);

  return {
    state,
    tokenExpiresAt: primary?.token_expires_at ?? null,
    connectedAccountCount,
    metaBusinessName: primary?.meta_business_name ?? null,
    needsReconnect: state === "expired" || state === "expires_soon" || state === "error",
  };
}
