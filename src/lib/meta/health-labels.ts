import type { MetaConnectionHealthState } from "@/lib/meta/health";

export const META_HEALTH_LABELS: Record<MetaConnectionHealthState, string> = {
  connected: "Connected",
  expires_soon: "Expires soon",
  expired: "Expired",
  disconnected: "Not connected",
  error: "Connection issue",
};

export const META_HEALTH_DESCRIPTIONS: Record<MetaConnectionHealthState, string> = {
  connected: "Meta Ads is connected for read-only reporting.",
  expires_soon: "Your Meta connection will expire soon. Reconnect to keep read-only access.",
  expired: "Your Meta connection has expired. Reconnect to restore read-only access.",
  disconnected: "Connect Meta Ads to import ad accounts for read-only reporting.",
  error: "There is a problem with the Meta connection. Try reconnecting.",
};

export function metaHealthBadgeVariant(
  state: MetaConnectionHealthState,
): "success" | "warning" | "danger" | "muted" {
  if (state === "connected") return "success";
  if (state === "expires_soon") return "warning";
  if (state === "expired" || state === "error") return "danger";
  return "muted";
}

export function formatTokenExpiryDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
