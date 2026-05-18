import type { MetaEnvConfig } from "@/lib/meta/env";

const META_OAUTH_SCOPE = "ads_read";

export type MetaTokenResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
};

export type MetaMeResponse = {
  id: string;
  name?: string;
};

export type MetaAdAccountNode = {
  id: string;
  name?: string;
  account_id?: string;
  account_status?: number;
  currency?: string;
  timezone_name?: string;
};

type MetaListResponse<T> = {
  data?: T[];
  error?: { message?: string; type?: string; code?: number };
};

function graphBase(config: MetaEnvConfig) {
  return `https://graph.facebook.com/${config.graphVersion}`;
}

export function buildMetaOAuthAuthorizeUrl(config: MetaEnvConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.appId,
    redirect_uri: config.redirectUri,
    state,
    scope: META_OAUTH_SCOPE,
    response_type: "code",
  });
  return `https://www.facebook.com/${config.graphVersion}/dialog/oauth?${params.toString()}`;
}

export async function exchangeCodeForAccessToken(
  config: MetaEnvConfig,
  code: string,
): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    client_id: config.appId,
    client_secret: config.appSecret,
    redirect_uri: config.redirectUri,
    code,
  });

  const url = `${graphBase(config)}/oauth/access_token?${params.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const body = (await res.json()) as MetaTokenResponse & { error?: { message?: string } };

  if (!res.ok || !body.access_token) {
    const detail = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Meta token exchange failed: ${detail}`);
  }

  return body;
}

/** Exchange a short-lived user token for a long-lived user token (server-only). */
export async function exchangeForLongLivedToken(
  config: MetaEnvConfig,
  shortLivedAccessToken: string,
): Promise<MetaTokenResponse> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: config.appId,
    client_secret: config.appSecret,
    fb_exchange_token: shortLivedAccessToken,
  });

  const url = `${graphBase(config)}/oauth/access_token?${params.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const body = (await res.json()) as MetaTokenResponse & { error?: { message?: string } };

  if (!res.ok || !body.access_token) {
    const detail = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Meta long-lived token exchange failed: ${detail}`);
  }

  return body;
}

export async function fetchMetaMe(
  config: MetaEnvConfig,
  accessToken: string,
): Promise<MetaMeResponse> {
  const params = new URLSearchParams({
    fields: "id,name",
    access_token: accessToken,
  });
  const url = `${graphBase(config)}/me?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const body = (await res.json()) as MetaMeResponse & { error?: { message?: string } };

  if (!res.ok || !body.id) {
    const detail = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Meta /me failed: ${detail}`);
  }

  return body;
}

export async function fetchMetaAdAccounts(
  config: MetaEnvConfig,
  accessToken: string,
): Promise<MetaAdAccountNode[]> {
  const params = new URLSearchParams({
    fields: "id,name,account_id,account_status,currency,timezone_name",
    access_token: accessToken,
    limit: "200",
  });
  const url = `${graphBase(config)}/me/adaccounts?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const body = (await res.json()) as MetaListResponse<MetaAdAccountNode>;

  if (!res.ok) {
    const detail = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`Meta ad accounts fetch failed: ${detail}`);
  }

  return body.data ?? [];
}

export function formatAccountStatus(status: number | undefined): string {
  if (status == null) return "unknown";
  const map: Record<number, string> = {
    1: "active",
    2: "disabled",
    3: "unsettled",
    7: "pending_risk_review",
    8: "pending_settlement",
    9: "in_grace_period",
    100: "pending_closure",
    101: "closed",
    201: "any_active",
    202: "any_closed",
  };
  return map[status] ?? String(status);
}

export function resolveMetaAdAccountId(account: MetaAdAccountNode): string {
  if (account.id) {
    return account.id.startsWith("act_") ? account.id : `act_${account.id}`;
  }
  if (account.account_id) {
    return account.account_id.startsWith("act_")
      ? account.account_id
      : `act_${account.account_id}`;
  }
  throw new Error("Ad account missing id");
}

export function displayAccountId(account: MetaAdAccountNode): string {
  if (account.account_id) return account.account_id;
  const id = resolveMetaAdAccountId(account);
  return id.startsWith("act_") ? id.slice(4) : id;
}
