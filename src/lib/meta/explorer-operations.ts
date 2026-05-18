export const META_EXPLORER_OPERATIONS = [
  "ad_accounts",
  "campaigns",
  "account_insights",
  "campaign_insights",
  "adset_insights",
  "ad_insights",
  "daily_insights",
  "actions_roas",
] as const;

export type MetaExplorerOperation = (typeof META_EXPLORER_OPERATIONS)[number];

export function isMetaExplorerOperation(value: string): value is MetaExplorerOperation {
  return (META_EXPLORER_OPERATIONS as readonly string[]).includes(value);
}

export const META_EXPLORER_OPERATION_LABELS: Record<MetaExplorerOperation, string> = {
  ad_accounts: "Fetch Ad Accounts",
  campaigns: "Fetch Campaigns",
  account_insights: "Fetch Account Insights",
  campaign_insights: "Fetch Campaign Insights",
  adset_insights: "Fetch Ad Set Insights",
  ad_insights: "Fetch Ad Insights",
  daily_insights: "Fetch Daily Insights",
  actions_roas: "Fetch Actions / ROAS",
};

/** Operations that require a selected ad account id (act_…). */
export function operationRequiresAdAccount(op: MetaExplorerOperation): boolean {
  return op !== "ad_accounts";
}

/** Insights probes use Meta date_preset=maximum for historical exploration. */
export const META_EXPLORER_INSIGHTS_DATE_PRESET = "maximum" as const;

export function operationUsesInsightsDatePreset(op: MetaExplorerOperation): boolean {
  return op !== "ad_accounts" && op !== "campaigns";
}
