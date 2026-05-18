/** Safe user-facing OAuth error codes (query param `reason`). */
export type MetaOAuthErrorReason =
  | "config"
  | "unauthorized"
  | "forbidden"
  | "permission_denied"
  | "invalid_state"
  | "token_exchange"
  | "no_accounts"
  | "connection_failed";

export const META_OAUTH_ERROR_MESSAGES: Record<MetaOAuthErrorReason, string> = {
  config: "Meta connection is not configured. Contact your administrator.",
  unauthorized: "Please sign in before connecting Meta Ads.",
  forbidden: "Only organization owners and admins can connect Meta Ads.",
  permission_denied: "Permission was not granted. Meta Ads read access is required.",
  invalid_state: "Connection session expired or was invalid. Please try again.",
  token_exchange: "Meta connection failed. Please try again.",
  no_accounts: "No ad accounts were found for this Meta user.",
  connection_failed: "Meta connection failed. Please try again.",
};

export function metaOAuthRedirectPath(
  reason?: MetaOAuthErrorReason,
  success?: boolean,
): string {
  const base = "/ad-accounts";
  if (success) {
    return `${base}?meta=connected`;
  }
  if (reason) {
    return `${base}?meta=error&reason=${reason}`;
  }
  return base;
}

export function metaDisconnectRedirectPath(): string {
  return "/ad-accounts?meta=disconnected";
}
