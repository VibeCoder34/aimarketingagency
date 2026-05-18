/**
 * Raw mock fixtures for the Northwind Media scenario.
 * Pages should consume normalized data via @/lib/data/get-dashboard-data, not these exports directly.
 */

import type {
  AccountHealthSummary,
  AiRecommendationPreview,
  Alert,
  BudgetPacingRow,
  BudgetPacingSnapshot,
  DataCoverageItem,
  KpiStats,
  OverviewAlertPreview,
  OverviewContext,
  PlatformBreakdown,
  RecommendedActionPreview,
  SpendChartPoint,
  TopCampaignRow,
  WhatChangedRow,
} from "@/types";

export const MOCK_OVERVIEW_CONTEXT: OverviewContext = {
  accountName: "Northwind Media",
  dateRangeLabel: "May 2026 snapshot",
  dateRangeDetail: "May 1–17, 2026",
  lastSyncedAgo: "12 min ago",
};

export const MOCK_ACCOUNT_HEALTH: AccountHealthSummary = {
  status: "needs_attention",
  statusLabel: "Needs Attention",
  explanation:
    "Spend is up 6.4% while blended ROAS is down 2.1%. Budget pacing is currently on track, but 3 campaigns need review.",
  chips: [
    { label: "Budget on track", variant: "success" },
    { label: "ROAS down", variant: "warning" },
    { label: "3 actions recommended", variant: "default" },
  ],
};

export const MOCK_KPI_STATS: KpiStats = {
  totalSpend: { value: 164_820, deltaPercent: 6.4, deltaDirection: "up" },
  avgROAS: { value: 3.42, deltaPercent: 2.1, deltaDirection: "down" },
  totalResults: { value: 36_780, deltaPercent: 5.2, deltaDirection: "up" },
  costPerResult: { value: 4.48, deltaPercent: 1.1, deltaDirection: "up" },
  totalClicks: { value: 892_400, deltaPercent: 4.8, deltaDirection: "up" },
  conversionRate: { value: 0.0412, deltaPercent: 0.6, deltaDirection: "neutral" },
};

export const MOCK_WHAT_CHANGED: WhatChangedRow[] = [
  {
    metricKey: "totalSpend",
    label: "Spend",
    deltaPercent: 6.4,
    deltaDirection: "up",
    explanation: "Spend increased vs the previous period, driven by scale on top performers.",
  },
  {
    metricKey: "avgROAS",
    label: "Blended ROAS",
    deltaPercent: 2.1,
    deltaDirection: "down",
    explanation: "Efficiency softened slightly as prospecting spend grew faster than revenue.",
  },
  {
    metricKey: "totalClicks",
    label: "Clicks",
    deltaPercent: 4.8,
    deltaDirection: "up",
    explanation: "Traffic volume rose in line with spend, with stable click-through on retargeting.",
  },
  {
    metricKey: "conversionRate",
    label: "Conversion Rate",
    deltaPercent: 0.6,
    deltaDirection: "neutral",
    explanation: "Conversion rate is effectively flat week over week.",
  },
];

export const MOCK_SPEND_CHART: SpendChartPoint[] = [
  { date: "2026-04-30", spend: 10_420, roas: 3.1 },
  { date: "2026-05-01", spend: 11_080, roas: 3.22 },
  { date: "2026-05-02", spend: 10_910, roas: 3.18 },
  { date: "2026-05-03", spend: 12_240, roas: 3.35 },
  { date: "2026-05-04", spend: 11_560, roas: 3.28 },
  { date: "2026-05-05", spend: 11_890, roas: 3.4 },
  { date: "2026-05-06", spend: 12_100, roas: 3.44 },
  { date: "2026-05-07", spend: 11_720, roas: 3.36 },
  { date: "2026-05-08", spend: 12_480, roas: 3.52 },
  { date: "2026-05-09", spend: 12_050, roas: 3.48 },
  { date: "2026-05-10", spend: 11_640, roas: 3.41 },
  { date: "2026-05-11", spend: 12_310, roas: 3.55 },
  { date: "2026-05-12", spend: 12_020, roas: 3.5 },
  { date: "2026-05-13", spend: 11_856, roas: 3.46 },
];

export const MOCK_SPEND_CHART_CAPTION =
  "Spend stayed elevated while ROAS softened during the last week.";

export const MOCK_TOP_CAMPAIGNS_ROAS: TopCampaignRow[] = [
  { id: "cmp-01", name: "Summer Sale 2026", status: "active", spend: 42_100, revenue: 189_450, roas: 4.5 },
  { id: "cmp-02", name: "Retargeting — Cart Abandoners", status: "active", spend: 18_600, revenue: 74_400, roas: 4.0 },
  { id: "cmp-03", name: "Lookalike — Top Customers", status: "active", spend: 22_300, revenue: 80_280, roas: 3.6 },
  { id: "cmp-04", name: "Brand Awareness Q2", status: "active", spend: 31_200, revenue: 93_600, roas: 3.0 },
  { id: "cmp-05", name: "Cold Traffic — US 25-45", status: "paused", spend: 29_400, revenue: 73_500, roas: 2.5 },
];

export const MOCK_RECOMMENDED_ACTIONS: RecommendedActionPreview[] = [
  {
    id: "prev-1",
    priority: "urgent",
    title: 'Review "Cold Traffic — US 25-45" in Ads Manager',
    whyItMatters: "ROAS 2.50x is below your 3.0x efficiency target for 14 consecutive days.",
    estimatedImpact: "Estimated ~$8,200/mo spend could be reallocated if paused manually.",
    manualActionNote: "Suggested manual action: pause or reduce budget in Meta Ads Manager.",
    impactVariant: "danger",
  },
  {
    id: "prev-2",
    priority: "high",
    title: 'Consider scaling "Summer Sale 2026" manually',
    whyItMatters: "Strong ROAS with remaining monthly budget headroom (~40% on this campaign).",
    estimatedImpact: "+$12,000 estimated revenue if budget is increased carefully in Ads Manager.",
    manualActionNote: "Apply in Meta Ads Manager — AdPilot does not change budgets.",
    impactVariant: "success",
  },
  {
    id: "prev-3",
    priority: "medium",
    title: 'Refresh creative for "Brand Awareness Q2"',
    whyItMatters: "CTR dropped 38% over 7 days — possible creative fatigue before ROAS declines further.",
    estimatedImpact: "Helps protect ROAS before efficiency erodes further.",
    manualActionNote: "Review manually: upload new creative variants in Meta Ads Manager.",
    impactVariant: "warning",
  },
];

/** @deprecated Use MOCK_RECOMMENDED_ACTIONS — kept for any legacy imports */
export const MOCK_AI_PREVIEW: AiRecommendationPreview[] = MOCK_RECOMMENDED_ACTIONS.map((a) => ({
  id: a.id,
  emoji: a.priority === "urgent" ? "🔴" : a.priority === "high" ? "🟢" : "🟡",
  title: a.title,
  description: a.whyItMatters,
  impact: a.estimatedImpact,
  impactVariant: a.impactVariant,
}));

const PACING_SPENT = 164_820;
const PACING_TOTAL = 200_000;
const PACING_DAYS_ELAPSED = 17;
const PACING_DAYS_TOTAL = 31;

export const MOCK_MAY_BUDGET_PACING: BudgetPacingSnapshot = {
  spent: PACING_SPENT,
  total: PACING_TOTAL,
  percent: Math.round((PACING_SPENT / PACING_TOTAL) * 1000) / 10,
  daysRemaining: PACING_DAYS_TOTAL - PACING_DAYS_ELAPSED,
  daysElapsed: PACING_DAYS_ELAPSED,
  daysTotal: PACING_DAYS_TOTAL,
  projectedMonthEndSpend: Math.round((PACING_SPENT / PACING_DAYS_ELAPSED) * PACING_DAYS_TOTAL),
  status: "on_track",
  statusLabel: "On Track",
};

export const MOCK_PLATFORM_BREAKDOWN: PlatformBreakdown[] = [
  { platform: "Facebook", spend: 98_892, percent: 60, roas: 3.48, clicks: 535_440, cpc: 0.18 },
  { platform: "Instagram", spend: 65_928, percent: 40, roas: 3.62, clicks: 356_960, cpc: 0.18 },
];

export const MOCK_PLATFORM_INSIGHT =
  "Instagram is currently more efficient based on ROAS and CPC.";

export const MOCK_DATA_COVERAGE: DataCoverageItem[] = [
  { id: "performance", label: "Performance data", status: "available" },
  { id: "campaigns", label: "Campaign data", status: "available" },
  { id: "daily", label: "Daily trends", status: "available" },
  { id: "conversions", label: "Conversions / actions", status: "partial", note: "Some action types may be aggregated" },
  { id: "roas", label: "ROAS / revenue", status: "available" },
  { id: "creatives", label: "Creative assets", status: "missing", note: "Not connected yet" },
  { id: "breakdowns", label: "Breakdowns", status: "limited", note: "Placement-level detail limited in demo" },
];

export const MOCK_OVERVIEW_ALERTS: OverviewAlertPreview[] = [
  {
    id: "ov-alert-1",
    severity: "high",
    title: "CTR dropped on Cold Traffic campaign",
    description: "7-day CTR down 38% vs prior period.",
    timeAgo: "2h ago",
  },
  {
    id: "ov-alert-2",
    severity: "medium",
    title: "Frequency rising on Retargeting",
    description: "Audience frequency crossed 3.2 — monitor fatigue.",
    timeAgo: "5h ago",
  },
  {
    id: "ov-alert-3",
    severity: "urgent",
    title: "ROAS below target on Brand Awareness Q2",
    description: "Blended ROAS at 3.0x — at efficiency floor.",
    timeAgo: "1d ago",
  },
];

export const MOCK_BUDGET_PACING: BudgetPacingRow[] = [];

export const MOCK_TOP_CAMPAIGNS = MOCK_TOP_CAMPAIGNS_ROAS;

export const MOCK_RECENT_ALERTS: Alert[] = [];
