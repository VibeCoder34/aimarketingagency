import type { MetaOverviewDatePresetId } from "@/lib/meta/overview-date-presets";

/** Matches public.meta_sync_type values used by reporting jobs. */
export type MetaReportingSyncType =
  | "overview"
  | "account_daily"
  | "campaign_insights"
  | "adset_insights"
  | "ad_insights"
  | "campaign_daily"
  | "adset_daily"
  | "ad_daily"
  | "breakdown_platform"
  | "breakdown_platform_position"
  | "breakdown_device"
  | "breakdown_demographics"
  | "breakdown_geo"
  | "creatives";

export type MetaInsightEntityLevel = "account" | "campaign" | "adset" | "ad";

export type MetaBreakdownKind =
  | "publisher_platform"
  | "platform_position"
  | "device_platform"
  | "age_gender"
  | "country"
  | "region";

export type ReportingInsightMetrics = {
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  /** Click-through rate in percentage points (4.36 = 4.36%). Meta API returns this format. */
  ctr: number;
  cpc: number;
  cpm: number;
  purchases: number | null;
  leads: number | null;
  addToCart: number | null;
  initiateCheckout: number | null;
  viewContent: number | null;
  landingPageView: number | null;
  linkClick: number | null;
  conversionValue: number | null;
  purchaseValue: number | null;
  costPerPurchase: number | null;
  costPerLead: number | null;
  roas: number | null;
  websitePurchaseRoas: number | null;
  results: number | null;
  costPerResult: number | null;
  conversionMetricsAvailable: boolean;
};

export type MetaReportingInsightRow = {
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  date_start?: string;
  date_stop?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  publisher_platform?: string;
  platform_position?: string;
  impression_device?: string;
  device_platform?: string;
  age?: string;
  gender?: string;
  country?: string;
  region?: string;
  actions?: { action_type: string; value?: string }[];
  action_values?: { action_type: string; value?: string }[];
  cost_per_action_type?: { action_type: string; value?: string }[];
  purchase_roas?: { action_type: string; value?: string }[];
  website_purchase_roas?: { action_type: string; value?: string }[];
  conversions?: { action_type: string; value?: string }[];
  conversion_values?: { action_type: string; value?: string }[];
};

export type MetaSyncAccountContext = {
  organizationId: string;
  connectedMetaAdAccountId: string;
  metaAdAccountId: string;
  datePreset: MetaOverviewDatePresetId;
};

export type MetaInsightsFetchOptions = {
  level?: MetaInsightEntityLevel;
  timeIncrement?: number;
  breakdowns?: string;
  limit?: number;
  /** When true, omit conversion fields (for incompatible breakdowns). */
  trafficOnly?: boolean;
};

export type MetaInsightsFetchResult = {
  rows: MetaReportingInsightRow[];
  truncated: boolean;
  pagesFetched: number;
  dateStart: string;
  dateEnd: string;
  usedTrafficOnlyFields: boolean;
};

export type MetaSyncJobResult = {
  syncType: MetaReportingSyncType;
  ok: boolean;
  syncRunId?: string;
  rowCount?: number;
  truncated?: boolean;
  error?: { code: string; message: string };
};

export const META_REPORTING_SYNC_JOBS: MetaReportingSyncType[] = [
  "overview",
  "account_daily",
  "campaign_insights",
  "adset_insights",
  "ad_insights",
  "campaign_daily",
  "adset_daily",
  "ad_daily",
  "breakdown_platform",
  "breakdown_platform_position",
  "breakdown_device",
  "breakdown_demographics",
  "breakdown_geo",
  "creatives",
];
