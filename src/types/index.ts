export type NavIconId =
  | "layout-dashboard"
  | "target"
  | "building-2"
  | "sparkles"
  | "photo"
  | "file-analytics"
  | "chart-line"
  | "bell"
  | "settings";

export type NavBadge = {
  variant: "danger" | "brand";
  count: number;
};

export type NavItem = {
  label: string;
  href: string;
  icon: NavIconId;
  badge?: NavBadge;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export type Account = {
  id: string;
  name: string;
  adAccountId: string;
  status: "active" | "paused";
  monthlyBudget: number;
  currentSpend: number;
  currency: string;
};

export type DeltaDirection = "up" | "down" | "neutral";

export type StatWithDelta = {
  value: number;
  deltaPercent: number;
  deltaDirection: DeltaDirection;
};

export type KpiStatKey =
  | "totalSpend"
  | "avgROAS"
  | "totalResults"
  | "costPerResult"
  | "totalClicks"
  | "conversionRate";

export type KpiStats = {
  totalSpend: StatWithDelta;
  avgROAS: StatWithDelta;
  totalResults: StatWithDelta;
  costPerResult: StatWithDelta;
  totalClicks: StatWithDelta;
  conversionRate: StatWithDelta;
};

export type OverviewContext = {
  accountName: string;
  dateRangeLabel: string;
  dateRangeDetail: string;
  lastSyncedAgo: string;
};

export type AccountHealthStatus = "healthy" | "needs_attention" | "at_risk";

export type AccountHealthSummary = {
  status: AccountHealthStatus;
  statusLabel: string;
  explanation: string;
  chips: { label: string; variant: "success" | "warning" | "danger" | "default" }[];
};

export type CampaignSignal =
  | "scaling_opportunity"
  | "needs_attention"
  | "wasted_spend"
  | "creative_refresh"
  | "stable";

export type DataCoverageStatus = "available" | "partial" | "missing" | "limited";

export type DataCoverageItem = {
  id: string;
  label: string;
  status: DataCoverageStatus;
  note?: string;
};

export type OverviewAlertPreview = {
  id: string;
  severity: "urgent" | "high" | "medium";
  title: string;
  description: string;
  timeAgo: string;
};

export type RecommendedActionPreview = {
  id: string;
  priority: "urgent" | "high" | "medium";
  title: string;
  whyItMatters: string;
  estimatedImpact: string;
  manualActionNote: string;
  impactVariant: "danger" | "success" | "warning";
};

export type BudgetPacingSnapshot = {
  spent: number;
  total: number;
  percent: number;
  daysRemaining: number;
  daysElapsed: number;
  daysTotal: number;
  projectedMonthEndSpend: number;
  status: "on_track" | "overpacing" | "underpacing";
  statusLabel: string;
};

export type WhatChangedRow = {
  metricKey: KpiStatKey;
  label: string;
  deltaPercent: number;
  deltaDirection: DeltaDirection;
  explanation: string;
};

export type SpendChartPoint = {
  date: string;
  spend: number;
  roas: number;
};

export type BudgetPacingRow = {
  accountName: string;
  budgetTotal: number;
  budgetSpent: number;
  daysTotal: number;
  daysElapsed: number;
  status: "on_track" | "overpacing" | "underpacing";
};

export type CampaignStatus = "active" | "paused" | "learning" | "ended" | "error";
export type CampaignObjective = "conversions" | "traffic" | "awareness";

export type TopCampaignRow = {
  id: string;
  name: string;
  status: CampaignStatus;
  spend: number;
  revenue: number;
  roas: number;
  clicks?: number;
  conversions?: number;
};

export type Campaign = {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  dailyBudget: number;
  spend: number;
  revenue: number;
  budget: number;
  roas: number;
  clicks: number;
  impressions: number;
  ctr: number;
  cpc: number;
  conversions: number;
  conversionRate: number;
  aiHealthScore: number | null;
  startDate: string;
  endDate: string;
};

export type AdSet = {
  id: string;
  name: string;
  audience: string;
  budget: number;
  spend: number;
  roas: number;
  status: CampaignStatus;
};

export type DailyStats = {
  date: string;
  spend: number;
  roas: number;
  clicks: number;
  impressions: number;
  conversions: number;
};

export type CreativeFormat = "image" | "video" | "carousel";

export type Creative = {
  id: string;
  name: string;
  format: CreativeFormat;
  spend: number;
  roas: number;
  ctr: number;
  thumbnail: string;
};

export type CampaignDetail = Campaign & {
  adSets: AdSet[];
  dailyStats: DailyStats[];
  topCreatives: Creative[];
  aiTips: { title: string; description: string }[];
};

export type Alert = {
  id: string;
  type: "danger" | "warning" | "info";
  title: string;
  description: string;
  createdAt: string;
};

export type AlertSeverity = "urgent" | "high" | "medium" | "low";

export type AlertCategory =
  | "budget"
  | "roas"
  | "creative"
  | "cpc"
  | "ctr"
  | "pacing"
  | "audience"
  | "learning"
  | "competitor"
  | "conversion"
  | "report";

export type AlertFeedItem = {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  icon: string;
  title: string;
  description: string;
  campaignName: string;
  timeAgo: string;
  isRead: boolean;
  isResolved: boolean;
};

export type CreativeAssetStatus = "top_performer" | "active" | "fatigued" | "paused";

export type CreativeAsset = {
  id: string;
  name: string;
  format: CreativeFormat;
  campaignName: string;
  spend: number;
  roas: number;
  ctr: number;
  impressions: number;
  status: CreativeAssetStatus;
  ageDays: number;
  aiGenerated?: boolean;
  color: string;
};

export type ReportFormat = "pdf" | "csv" | "slides" | "both";
export type ReportStatus = "sent" | "downloaded" | "generating";

export type SavedReportTemplate = {
  id: string;
  name: string;
  lastGenerated: string;
  autoSend: string;
  format: string;
};

export type PastReport = {
  id: string;
  name: string;
  type: "automated" | "manual";
  dateGenerated: string;
  periodCovered: string;
  format: string;
  status: ReportStatus;
};

export type ReportMetricCategory = "performance" | "delivery" | "engagement";

export type ReportMetricOption = {
  id: string;
  label: string;
  category: ReportMetricCategory;
};

export type AiRecommendationPriority = "urgent" | "high" | "medium" | "low";
export type AiRecommendationCategory =
  | "budget"
  | "creative"
  | "audience"
  | "structure"
  | "scaling";

export type AiRecommendation = {
  id: string;
  priority: AiRecommendationPriority;
  category: AiRecommendationCategory;
  categoryLabel: string;
  title: string;
  explanation: string;
  dataPoints: string[];
  impact: string;
  applied?: boolean;
  dismissed?: boolean;
};

export type AiRecommendationPreview = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  impact: string;
  impactVariant: "danger" | "success" | "warning";
};

export type PlatformBreakdown = {
  platform: string;
  spend: number;
  percent: number;
  roas?: number;
  clicks?: number;
  cpc?: number;
  /** @deprecated Prefer cpc on Overview; analytics mock still uses CPM */
  cpm?: number;
};
