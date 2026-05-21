/**
 * AdPilot internal product data model.
 * Not Meta API response shapes — normalize at the adapter boundary.
 */

export type DataSourceType = "mock" | "meta";

export type DateRange = {
  /** Optional preset id, e.g. "may-2026-snapshot" */
  preset?: string;
  start: string;
  end: string;
  label?: string;
  detailLabel?: string;
};

export type DeltaDirection = "up" | "down" | "neutral";

// ——— Entities ———

export type NormalizedAccount = {
  id: string;
  name: string;
  currency: string;
  metaAdAccountId?: string | null;
  monthlyBudget?: number;
};

export type NormalizedCampaignStatus = "active" | "paused" | "learning" | "ended" | "error";

export type NormalizedCampaignObjective = "conversions" | "traffic" | "awareness";

export type NormalizedCampaign = {
  id: string;
  accountId: string;
  name: string;
  status: NormalizedCampaignStatus;
  objective?: NormalizedCampaignObjective;
  spend: number;
  revenue: number;
  roas: number;
  clicks?: number;
  conversions?: number;
  impressions?: number;
  dailyBudget?: number;
  budget?: number;
  cpc?: number;
  ctr?: number;
  conversionRate?: number;
  /** Cost per result (spend / conversions) when conversions are available */
  cpa?: number | null;
  aiHealthScore?: number | null;
  accountName?: string;
  startDate?: string;
  endDate?: string;
};

export type NormalizedAdSet = {
  id: string;
  campaignId: string;
  name: string;
  status: NormalizedCampaignStatus;
  audience?: string;
  spend: number;
  roas: number;
  budget?: number;
};

export type NormalizedAd = {
  id: string;
  adSetId: string;
  campaignId: string;
  name: string;
  status: NormalizedCampaignStatus;
  spend: number;
  roas?: number;
};

export type NormalizedDailyInsight = {
  date: string;
  spend: number;
  roas: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  revenue?: number;
};

// ——— Overview & analytics slices ———

export type CampaignSignal =
  | "scaling_opportunity"
  | "needs_attention"
  | "wasted_spend"
  | "creative_refresh"
  | "stable"
  | "limited_data";

/** Campaign row for list/table views with signal and read-only guidance */
export type NormalizedCampaignListItem = NormalizedCampaign & {
  signal: CampaignSignal;
  manualActionNote: string;
};

export type NormalizedCampaignSummary = NormalizedCampaignListItem;

/** Campaign row from cached meta_campaign_insights (Overview signals). */
export type OverviewCampaignInsightRow = {
  campaignId: string;
  campaignName: string;
  accountId: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  frequency: number;
  leads: number | null;
  purchases: number | null;
  costPerLead: number | null;
  costPerPurchase: number | null;
  roas: number | null;
  conversionValue: number | null;
  results: number | null;
  resultType: "lead" | "purchase" | "none";
};

export type OverviewCampaignSignalsResultMode = "lead" | "purchase" | "traffic";

export type OverviewCampaignSignals = {
  available: boolean;
  resultMode: OverviewCampaignSignalsResultMode;
  purchaseRoasAvailable: boolean;
  campaigns: OverviewCampaignInsightRow[];
  topSpending: OverviewCampaignInsightRow[];
  bestLeads: OverviewCampaignInsightRow[];
  highSpendNoResults: OverviewCampaignInsightRow[];
  lowCtr: OverviewCampaignInsightRow[];
  highFrequency: OverviewCampaignInsightRow[];
  leadBasedLabel?: string;
  purchaseUnavailableLabel?: string;
  emptyMessage?: string;
};

export type OverviewKpiTier = "primary" | "secondary";

export type OverviewKpi = {
  id: string;
  label: string;
  value: number;
  valueMode: "currency" | "number" | "ratio" | "percent" | "percent_points";
  deltaPercent: number;
  deltaDirection: DeltaDirection;
  interpretation: string;
  /** When true, "up" delta is negative for efficiency metrics (ROAS, CPA) */
  invertDelta?: boolean;
  tier?: OverviewKpiTier;
  /** When false, card shows unavailable state instead of a numeric value */
  available?: boolean;
  unavailableReason?: string;
};

export type OverviewFunnelStep = {
  id: string;
  label: string;
  value: number | null;
  /** Step-over-step rate (%), null when prior step is missing or zero */
  rateFromPrevious: number | null;
  missing?: boolean;
};

export type OverviewFunnelVariant = "ecommerce" | "lead_gen" | "mixed" | "unknown";

export type OverviewFunnelMetrics = {
  variant: OverviewFunnelVariant;
  steps: OverviewFunnelStep[];
  message?: string;
};

/** Performance outcomes normalized from Meta actions — feeds KPIs, funnel, and future AI context */
export type OverviewPerformance = {
  results: number | null;
  resultType: string | null;
  costPerResult: number | null;
  conversionValue: number | null;
  roas: number | null;
  purchases: number | null;
  leads: number | null;
  addToCart: number | null;
  initiateCheckout: number | null;
  viewContent: number | null;
  landingPageViews: number | null;
  funnelMetrics: OverviewFunnelMetrics;
  hasConversionData: boolean;
  conversionCoverageMessage?: string;
};

export type OverviewDataSourceLabel = "demo" | "live_meta";

export type OverviewDisplayMode =
  | "demo"
  | "full"
  | "select_account"
  | "no_snapshot"
  | "no_accounts"
  | "reconnect_required";

export type AccountOverviewContext = {
  accountName: string;
  dateRangeLabel: string;
  dateRangeDetail: string;
  lastSyncedAgo: string;
  /** Product label for mock vs live Meta data */
  dataSourceLabel?: OverviewDataSourceLabel;
  dataSourceBadge?: string;
  demoCtaLabel?: string;
  canRefreshData?: boolean;
  /** Internal connected_meta_ad_accounts.id for refresh API */
  connectedMetaAdAccountUuid?: string;
  metaAdAccountId?: string;
  bannerTitle?: string;
  bannerMessage?: string;
  /** Meta Insights date_preset used for cache + sync (live mode) */
  dateRangePreset?: string;
};

export type AccountHealthStatus = "healthy" | "needs_attention" | "at_risk";

export type AccountHealth = {
  status: AccountHealthStatus;
  statusLabel: string;
  explanation: string;
  chips: { label: string; variant: "success" | "warning" | "danger" | "default" }[];
};

export type WhatChangedItem = {
  id: string;
  label: string;
  deltaPercent: number;
  deltaDirection: DeltaDirection;
  explanation: string;
};

export type RecommendationPriority = "urgent" | "high" | "medium" | "low";

/** @deprecated Prefer NormalizedRecommendation on the Recommendations page */
export type Recommendation = {
  id: string;
  priority: RecommendationPriority;
  title: string;
  whyItMatters: string;
  estimatedImpact: string;
  manualActionNote: string;
  impactVariant: "danger" | "success" | "warning";
  relatedCampaignId?: string;
};

// ——— Recommendations module ———

export type RecommendationCategory =
  | "budget"
  | "creative"
  | "audience"
  | "structure"
  | "scaling"
  | "tracking";

export type RecommendationStatus =
  | "new"
  | "reviewed"
  | "planned"
  | "done_manually"
  | "dismissed";

export type RecommendationSourceEntityType = "account" | "campaign" | "adset" | "ad";

export type RecommendationEvidencePoint = {
  label: string;
  value: string;
};

export type RecommendationManualAction = {
  summary: string;
  steps: string[];
  metaAdsManagerHint?: string;
};

export type RecommendationImpactEstimate = {
  summary: string;
  monthlySavingsUsd?: number;
  monthlyRevenueUpliftUsd?: number;
  variant: "danger" | "success" | "warning" | "default";
};

export type RecommendationSourceEntity = {
  type: RecommendationSourceEntityType;
  id: string;
  name: string;
};

export type NormalizedRecommendation = {
  id: string;
  title: string;
  summary: string;
  explanation: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  status: RecommendationStatus;
  sourceEntityType: RecommendationSourceEntityType;
  sourceEntityId: string;
  sourceEntityName: string;
  evidencePoints: RecommendationEvidencePoint[];
  impactEstimate: RecommendationImpactEstimate;
  riskLevel: "low" | "medium" | "high";
  manualAction: RecommendationManualAction;
  readOnlyNotice: string;
  createdAt: string;
  updatedAt: string;
};

export type RecommendationDataSummary = {
  activeCount: number;
  urgentCount: number;
  estimatedMonthlySavingsUsd: number;
  estimatedRevenueUpliftUsd: number;
  lastAnalyzedLabel: string;
  lastAnalyzedAt: string;
};

export type RecommendationData = {
  source: DataSourceType;
  account: NormalizedAccount;
  dateRange: DateRange;
  context: AccountOverviewContext;
  summary: RecommendationDataSummary;
  recommendations: NormalizedRecommendation[];
};

export type AlertSeverity = "urgent" | "high" | "medium" | "low";

export type Alert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  timeAgo: string;
  campaignId?: string;
  category?: string;
};

export type BudgetPacingStatus = "on_track" | "overpacing" | "underpacing";

export type BudgetPacing = {
  spent: number;
  total: number;
  percent: number;
  daysRemaining: number;
  daysElapsed: number;
  daysTotal: number;
  projectedMonthEndSpend: number;
  status: BudgetPacingStatus;
  statusLabel: string;
  currency: string;
};

export type PlatformBreakdown = {
  platform: string;
  spend: number;
  percent: number;
  roas?: number;
  clicks?: number;
  cpc?: number;
};

export type DataCoverageStatus = "available" | "partial" | "missing" | "limited";

export type DataCoverageScore = {
  id: string;
  label: string;
  status: DataCoverageStatus;
  note?: string;
};

export type AIQuickAction = {
  actionId: string;
  label: string;
};

// ——— Aggregates ———

export type OverviewSectionMessages = {
  spendChart?: string;
  campaigns?: string;
  recommendations?: string;
  budgetPacing?: string;
};

export type OverviewData = {
  source: DataSourceType;
  displayMode: OverviewDisplayMode;
  account: NormalizedAccount;
  dateRange: DateRange;
  context: AccountOverviewContext;
  health: AccountHealth;
  kpis: OverviewKpi[];
  /** Conversion-aware outcomes (live Meta + demo) */
  performance?: OverviewPerformance | null;
  dailyInsights: NormalizedDailyInsight[];
  spendChartCaption: string;
  whatChanged: WhatChangedItem[];
  campaigns: NormalizedCampaignSummary[];
  /** Live Meta campaign signals from meta_campaign_insights */
  campaignSignals?: OverviewCampaignSignals | null;
  recommendations: Recommendation[];
  budgetPacing: BudgetPacing | null;
  platformBreakdown: PlatformBreakdown[];
  platformInsight: string;
  dataCoverage: DataCoverageScore[];
  alerts: Alert[];
  aiQuickActions: AIQuickAction[];
  sectionMessages?: OverviewSectionMessages;
};

export type CampaignsData = {
  source: DataSourceType;
  account: NormalizedAccount;
  dateRange: DateRange;
  context: AccountOverviewContext;
  campaigns: NormalizedCampaignListItem[];
};

export type CampaignDetailMetrics = {
  spend: number;
  revenue: number;
  roas: number;
  cpa: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  dailyBudget: number | null;
  aiHealthScore: number | null;
  /** Metric keys that are unavailable for this campaign */
  missingFields: string[];
};

export type CampaignSchedule = {
  startDate: string | null;
  endDate: string | null;
};

export type CampaignDetailInsight = {
  id: string;
  title: string;
  description: string;
  variant: "info" | "warning";
};

export type CampaignDetailWarning = {
  id: string;
  severity: "urgent" | "high" | "medium";
  title: string;
  description: string;
};

export type CampaignDetailCreative = {
  id: string;
  name: string;
  format: "image" | "video" | "carousel";
  spend: number;
  roas: number;
  ctr: number;
  thumbnailColor: string;
};

export type CampaignDataCompleteness = "full" | "partial" | "limited";

export type CampaignDetailDataFound = {
  found: true;
  source: DataSourceType;
  account: NormalizedAccount;
  dateRange: DateRange;
  campaign: NormalizedCampaignListItem;
  metrics: CampaignDetailMetrics;
  schedule: CampaignSchedule;
  dailyTrend: NormalizedDailyInsight[];
  adSets: NormalizedAdSet[];
  creatives: CampaignDetailCreative[];
  insights: CampaignDetailInsight[];
  warnings: CampaignDetailWarning[];
  dataCompleteness: CampaignDataCompleteness;
  readOnlyNotice: string;
  metaAdsManagerUrl: string | null;
};

export type CampaignDetailDataNotFound = {
  found: false;
  source: DataSourceType;
  campaignId: string;
  account: NormalizedAccount;
  dateRange: DateRange;
  message: string;
};

export type CampaignDetailData = CampaignDetailDataFound | CampaignDetailDataNotFound;

/** Payload for future LLM / Copilot integration (no API calls yet). */
export type AIContextPayload = {
  source: DataSourceType;
  generatedAt: string;
  account: {
    id: string;
    name: string;
    currency: string;
    dateRange: DateRange;
  };
  accountSummary: {
    healthStatus: AccountHealthStatus;
    healthLabel: string;
    explanation: string;
  };
  kpiSummary: {
    label: string;
    value: number;
    valueMode: OverviewKpi["valueMode"];
    deltaPercent: number;
    deltaDirection: DeltaDirection;
  }[];
  performance: {
    results: number | null;
    resultType: string | null;
    costPerResult: number | null;
    conversionValue: number | null;
    roas: number | null;
    purchases: number | null;
    leads: number | null;
    funnelVariant: OverviewFunnelVariant;
    hasConversionData: boolean;
  } | null;
  campaignSignals: {
    campaignId: string;
    campaignName: string;
    signal: CampaignSignal;
    roas: number;
    spend: number;
    status: NormalizedCampaignStatus;
  }[];
  recommendedActions: Recommendation[];
  dataCoverage: DataCoverageScore[];
  alerts: Alert[];
  budgetPacing: Pick<
    BudgetPacing,
    "spent" | "total" | "percent" | "status" | "statusLabel" | "projectedMonthEndSpend" | "daysRemaining"
  >;
  readOnlyDisclaimer: string;
};
