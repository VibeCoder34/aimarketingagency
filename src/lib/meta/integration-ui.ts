import type { AdAccountsPageData } from "@/lib/meta/queries";
import type { MetaConnectionHealthState } from "@/lib/meta/health";
import type { DataSourceType } from "@/lib/data/types";

/** Product-facing integration status for the Settings Meta card. */
export type MetaIntegrationStatus =
  | "not_connected"
  | "connected"
  | "connected_no_accounts"
  | "reconnect_required"
  | "connection_issue";

export const META_INTEGRATION_STATUS_LABELS: Record<MetaIntegrationStatus, string> = {
  not_connected: "Not connected",
  connected: "Connected",
  connected_no_accounts: "Connected, needs attention",
  reconnect_required: "Reconnect required",
  connection_issue: "Connection issue",
};

export function getMetaIntegrationStatus(data: AdAccountsPageData): MetaIntegrationStatus {
  const state: MetaConnectionHealthState = data.health?.state ?? "disconnected";

  if (state === "disconnected") {
    return "not_connected";
  }

  if (state === "expired") {
    return "reconnect_required";
  }

  if (state === "error") {
    return "connection_issue";
  }

  if (state === "expires_soon") {
    return "reconnect_required";
  }

  if (state === "connected" && data.accounts.length === 0) {
    return "connected_no_accounts";
  }

  return "connected";
}

export function integrationStatusBadgeVariant(
  status: MetaIntegrationStatus,
): "success" | "warning" | "danger" | "muted" {
  if (status === "connected") return "success";
  if (status === "connected_no_accounts" || status === "reconnect_required") return "warning";
  if (status === "connection_issue") return "danger";
  return "muted";
}

export function isMetaConnectionUsable(data: AdAccountsPageData): boolean {
  const status = getMetaIntegrationStatus(data);
  return status === "connected";
}

/** Show connect empty state on product pages when using live Meta data (not mock demo). */
export function shouldShowMetaNotConnectedEmpty(
  data: AdAccountsPageData,
  source: DataSourceType,
): boolean {
  if (source === "mock") {
    return false;
  }
  return !isMetaConnectionUsable(data);
}
