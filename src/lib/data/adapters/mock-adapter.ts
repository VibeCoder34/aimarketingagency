/**
 * Mock data adapter — maps raw fixture mocks to AdPilot normalized types.
 * Source fixtures live in @/lib/mock/* (scenario data only).
 */

import type { CampaignDetailRequestParams, DataRequestParams } from "@/lib/data/params";
import { DEFAULT_MOCK_ACCOUNT_ID, DEFAULT_MOCK_DATE_RANGE } from "@/lib/data/params";
import { attachCampaignSignals, enrichCampaignListItem } from "@/lib/data/campaign-signals";
import {
  buildCampaignMetrics,
  buildCampaignWarnings,
  buildMetaAdsManagerPlaceholder,
  CAMPAIGN_DETAIL_READ_ONLY_NOTICE,
  resolveDataCompleteness,
  toReadOnlyInsight,
} from "@/lib/data/campaign-detail-helpers";
import {
  buildAllMockRecommendations,
  computeRecommendationSummary,
  toOverviewRecommendations,
} from "@/lib/data/recommendation-engine";
import type {
  CampaignDetailData,
  CampaignDetailCreative,
  CampaignsData,
  NormalizedAccount,
  NormalizedAdSet,
  NormalizedCampaign,
  NormalizedDailyInsight,
  OverviewData,
  OverviewKpi,
  OverviewPerformance,
  RecommendationData,
} from "@/lib/data/types";
import type { Campaign } from "@/types";
import {
  MOCK_ACCOUNT_HEALTH,
  MOCK_DATA_COVERAGE,
  MOCK_KPI_STATS,
  MOCK_MAY_BUDGET_PACING,
  MOCK_OVERVIEW_ALERTS,
  MOCK_OVERVIEW_CONTEXT,
  MOCK_PLATFORM_BREAKDOWN,
  MOCK_PLATFORM_INSIGHT,
  MOCK_SPEND_CHART,
  MOCK_SPEND_CHART_CAPTION,
  MOCK_TOP_CAMPAIGNS_ROAS,
  MOCK_WHAT_CHANGED,
} from "@/lib/mock/dashboard.mock";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns.mock";
import {
  buildLast14DailyStats,
  DEFAULT_DETAIL_TIPS,
  DETAIL_AD_SETS,
  DETAIL_CREATIVES,
  DETAIL_TIPS,
} from "@/lib/mock/campaign-detail.fixtures";

const MOCK_ACCOUNTS: Record<string, NormalizedAccount> = {
  [DEFAULT_MOCK_ACCOUNT_ID]: {
    id: DEFAULT_MOCK_ACCOUNT_ID,
    name: "Northwind Media",
    currency: "USD",
    metaAdAccountId: "act_mock_northwind_001",
    monthlyBudget: 200_000,
  },
};

function resolveAccount(accountId: string): NormalizedAccount {
  return MOCK_ACCOUNTS[accountId] ?? {
    id: accountId,
    name: MOCK_OVERVIEW_CONTEXT.accountName,
    currency: "USD",
    metaAdAccountId: null,
    monthlyBudget: MOCK_MAY_BUDGET_PACING.total,
  };
}

function mapTopCampaignsToNormalized(accountId: string): NormalizedCampaign[] {
  return MOCK_TOP_CAMPAIGNS_ROAS.map((c) => ({
    id: c.id,
    accountId,
    name: c.name,
    status: c.status,
    spend: c.spend,
    revenue: c.revenue,
    roas: c.roas,
    clicks: c.clicks,
    conversions: c.conversions,
  }));
}

function buildMockOverviewPerformance(): OverviewPerformance {
  return {
    results: MOCK_KPI_STATS.totalResults.value,
    resultType: "Purchases",
    costPerResult: MOCK_KPI_STATS.costPerResult.value,
    conversionValue: 563_684,
    roas: MOCK_KPI_STATS.avgROAS.value,
    purchases: 8_420,
    leads: 1_240,
    addToCart: 24_600,
    initiateCheckout: 12_800,
    viewContent: 156_000,
    landingPageViews: 412_000,
    funnelMetrics: {
      variant: "ecommerce",
      steps: [
        { id: "impressions", label: "Impressions", value: 4_200_000, rateFromPrevious: null },
        { id: "clicks", label: "Clicks", value: 892_400, rateFromPrevious: 21.2 },
        { id: "landing_page_views", label: "Landing page views", value: 412_000, rateFromPrevious: 46.2 },
        { id: "view_content", label: "View content", value: 156_000, rateFromPrevious: 37.9 },
        { id: "add_to_cart", label: "Add to cart", value: 24_600, rateFromPrevious: 15.8 },
        { id: "initiate_checkout", label: "Initiate checkout", value: 12_800, rateFromPrevious: 52.0 },
        { id: "purchases", label: "Purchases", value: 8_420, rateFromPrevious: 65.8 },
      ],
    },
    hasConversionData: true,
  };
}

function buildOverviewKpis(): OverviewKpi[] {
  return [
    {
      id: "totalSpend",
      label: "Spend",
      value: MOCK_KPI_STATS.totalSpend.value,
      valueMode: "currency",
      deltaPercent: MOCK_KPI_STATS.totalSpend.deltaPercent,
      deltaDirection: MOCK_KPI_STATS.totalSpend.deltaDirection,
      interpretation: "Spend increased vs the previous period.",
      tier: "primary",
    },
    {
      id: "totalResults",
      label: "Purchases",
      value: MOCK_KPI_STATS.totalResults.value,
      valueMode: "number",
      deltaPercent: MOCK_KPI_STATS.totalResults.deltaPercent,
      deltaDirection: MOCK_KPI_STATS.totalResults.deltaDirection,
      interpretation: "Conversion volume grew with higher spend.",
      tier: "primary",
    },
    {
      id: "costPerResult",
      label: "Cost per Result",
      value: MOCK_KPI_STATS.costPerResult.value,
      valueMode: "currency",
      deltaPercent: MOCK_KPI_STATS.costPerResult.deltaPercent,
      deltaDirection: MOCK_KPI_STATS.costPerResult.deltaDirection,
      interpretation: "Cost per result rose as prospecting scaled.",
      invertDelta: true,
      tier: "primary",
    },
    {
      id: "avgROAS",
      label: "ROAS",
      value: MOCK_KPI_STATS.avgROAS.value,
      valueMode: "ratio",
      deltaPercent: MOCK_KPI_STATS.avgROAS.deltaPercent,
      deltaDirection: MOCK_KPI_STATS.avgROAS.deltaDirection,
      interpretation: "Efficiency softened slightly week over week.",
      invertDelta: true,
      tier: "primary",
    },
    {
      id: "ctr",
      label: "CTR",
      value: 2.12,
      valueMode: "percent_points",
      deltaPercent: 0.3,
      deltaDirection: "up",
      interpretation: "Click-through rate for the period.",
      tier: "secondary",
    },
    {
      id: "cpc",
      label: "CPC",
      value: 0.18,
      valueMode: "currency",
      deltaPercent: 1.2,
      deltaDirection: "up",
      interpretation: "Cost per click.",
      tier: "secondary",
      invertDelta: true,
    },
    {
      id: "cpm",
      label: "CPM",
      value: 3.92,
      valueMode: "currency",
      deltaPercent: 0.8,
      deltaDirection: "neutral",
      interpretation: "Cost per 1,000 impressions.",
      tier: "secondary",
      invertDelta: true,
    },
    {
      id: "frequency",
      label: "Frequency",
      value: 2.4,
      valueMode: "number",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: "Average impressions per reached user.",
      tier: "secondary",
    },
  ];
}

function mapDailyInsights(): NormalizedDailyInsight[] {
  return MOCK_SPEND_CHART.map((row) => ({
    date: row.date,
    spend: row.spend,
    roas: row.roas,
  }));
}

function buildMockContext(account: NormalizedAccount, dateRange: DataRequestParams["dateRange"]) {
  const resolvedRange = {
    ...DEFAULT_MOCK_DATE_RANGE,
    ...dateRange,
    label: dateRange.label ?? DEFAULT_MOCK_DATE_RANGE.label,
    detailLabel: dateRange.detailLabel ?? DEFAULT_MOCK_DATE_RANGE.detailLabel,
  };
  return {
    account,
    dateRange: resolvedRange,
    context: {
      accountName: account.name,
      dateRangeLabel: resolvedRange.label ?? MOCK_OVERVIEW_CONTEXT.dateRangeLabel,
      dateRangeDetail: resolvedRange.detailLabel ?? MOCK_OVERVIEW_CONTEXT.dateRangeDetail,
      lastSyncedAgo: MOCK_OVERVIEW_CONTEXT.lastSyncedAgo,
    },
  };
}

/** @internal Mock-only — recommendations action center */
export function getMockRecommendationsData(params: DataRequestParams): RecommendationData {
  const account = resolveAccount(params.accountId);
  const { dateRange, context } = buildMockContext(account, params.dateRange);

  const campaigns = MOCK_CAMPAIGNS.map((c) =>
    enrichCampaignListItem(mapRawCampaignToNormalized(c, account.id)),
  );
  const recommendations = buildAllMockRecommendations(campaigns);

  return {
    source: "mock",
    account,
    dateRange,
    context,
    summary: computeRecommendationSummary(recommendations),
    recommendations,
  };
}

/** @internal Mock-only — returns Northwind Media overview scenario */
export function getMockOverviewData(params: DataRequestParams): OverviewData {
  const account = resolveAccount(params.accountId);
  const { dateRange, context } = buildMockContext(account, params.dateRange);

  const campaigns = attachCampaignSignals(mapTopCampaignsToNormalized(account.id));
  const recommendationsData = getMockRecommendationsData(params);

  return {
    source: "mock",
    displayMode: "demo",
    account,
    dateRange,
    context: {
      ...context,
      dataSourceLabel: "demo",
      dataSourceBadge: "Demo data",
      demoCtaLabel: "Connect Meta to see live data",
      canRefreshData: false,
    },
    health: {
      status: MOCK_ACCOUNT_HEALTH.status,
      statusLabel: MOCK_ACCOUNT_HEALTH.statusLabel,
      explanation: MOCK_ACCOUNT_HEALTH.explanation,
      chips: MOCK_ACCOUNT_HEALTH.chips,
    },
    kpis: buildOverviewKpis(),
    performance: buildMockOverviewPerformance(),
    dailyInsights: mapDailyInsights(),
    spendChartCaption: MOCK_SPEND_CHART_CAPTION,
    whatChanged: MOCK_WHAT_CHANGED.map((row) => ({
      id: row.metricKey,
      label: row.label,
      deltaPercent: row.deltaPercent,
      deltaDirection: row.deltaDirection,
      explanation: row.explanation,
    })),
    campaigns,
    recommendations: toOverviewRecommendations(recommendationsData.recommendations, 3),
    budgetPacing: {
      spent: MOCK_MAY_BUDGET_PACING.spent,
      total: MOCK_MAY_BUDGET_PACING.total,
      percent: MOCK_MAY_BUDGET_PACING.percent,
      daysRemaining: MOCK_MAY_BUDGET_PACING.daysRemaining,
      daysElapsed: MOCK_MAY_BUDGET_PACING.daysElapsed,
      daysTotal: MOCK_MAY_BUDGET_PACING.daysTotal,
      projectedMonthEndSpend: MOCK_MAY_BUDGET_PACING.projectedMonthEndSpend,
      status: MOCK_MAY_BUDGET_PACING.status,
      statusLabel: MOCK_MAY_BUDGET_PACING.statusLabel,
      currency: account.currency,
    },
    platformBreakdown: MOCK_PLATFORM_BREAKDOWN.map((p) => ({
      platform: p.platform,
      spend: p.spend,
      percent: p.percent,
      roas: p.roas,
      clicks: p.clicks,
      cpc: p.cpc,
    })),
    platformInsight: MOCK_PLATFORM_INSIGHT,
    dataCoverage: MOCK_DATA_COVERAGE.map((item) => ({
      id: item.id,
      label: item.label,
      status: item.status,
      note: item.note,
    })),
    alerts: MOCK_OVERVIEW_ALERTS.map((a) => ({
      id: a.id,
      severity: a.severity,
      title: a.title,
      description: a.description,
      timeAgo: a.timeAgo,
    })),
    aiQuickActions: [
      { actionId: "ov-explain", label: "Explain performance" },
      { actionId: "ov-client", label: "Generate client update" },
      { actionId: "ov-exec", label: "Create executive summary" },
      { actionId: "ov-risks", label: "Find top risks" },
    ],
  };
}

function mapRawCampaignToNormalized(c: Campaign, accountId: string): NormalizedCampaign {
  return {
    id: c.id,
    accountId,
    name: c.name,
    status: c.status,
    objective: c.objective,
    spend: c.spend,
    revenue: c.revenue,
    roas: c.roas,
    clicks: c.clicks,
    conversions: c.conversions,
    impressions: c.impressions,
    dailyBudget: c.dailyBudget,
    budget: c.budget,
    cpc: c.cpc,
    ctr: c.ctr,
    conversionRate: c.conversionRate,
    aiHealthScore: c.aiHealthScore,
    accountName: c.accountName,
    startDate: c.startDate,
    endDate: c.endDate,
  };
}

/** @internal Mock-only — full campaign list for campaigns page */
export function getMockCampaignsData(params: DataRequestParams): CampaignsData {
  const account = resolveAccount(params.accountId);
  const { dateRange, context } = buildMockContext(account, params.dateRange);

  const campaigns = MOCK_CAMPAIGNS.map((c) =>
    enrichCampaignListItem(mapRawCampaignToNormalized(c, account.id)),
  );

  return {
    source: "mock",
    account,
    dateRange,
    context,
    campaigns,
  };
}

function mapAdSets(campaignId: string): NormalizedAdSet[] {
  const sets = DETAIL_AD_SETS[campaignId] ?? DETAIL_AD_SETS["cmp-01"] ?? [];
  return sets.map((a) => ({
    id: a.id,
    campaignId,
    name: a.name,
    status: a.status,
    audience: a.audience,
    spend: a.spend,
    roas: a.roas,
    budget: a.budget,
  }));
}

function mapCreatives(campaignId: string): CampaignDetailCreative[] {
  const creatives = DETAIL_CREATIVES[campaignId] ?? DETAIL_CREATIVES["cmp-01"] ?? [];
  return creatives.map((cr) => ({
    id: cr.id,
    name: cr.name,
    format: cr.format,
    spend: cr.spend,
    roas: cr.roas,
    ctr: cr.ctr,
    thumbnailColor: cr.thumbnail,
  }));
}

function mapDailyTrend(campaign: NormalizedCampaign): NormalizedDailyInsight[] {
  return buildLast14DailyStats(campaign.spend, campaign.roas).map((d) => ({
    date: d.date,
    spend: d.spend,
    roas: d.roas,
    clicks: d.clicks,
    impressions: d.impressions,
    conversions: d.conversions,
    revenue: d.spend * d.roas,
  }));
}

/** @internal Mock-only — single campaign detail for panel and detail route */
export function getMockCampaignDetailData(params: CampaignDetailRequestParams): CampaignDetailData {
  const account = resolveAccount(params.accountId);
  const dateRange = {
    ...DEFAULT_MOCK_DATE_RANGE,
    ...params.dateRange,
    label: params.dateRange.label ?? DEFAULT_MOCK_DATE_RANGE.label,
    detailLabel: params.dateRange.detailLabel ?? DEFAULT_MOCK_DATE_RANGE.detailLabel,
  };

  const raw = MOCK_CAMPAIGNS.find((c) => c.id === params.campaignId);
  if (!raw) {
    return {
      found: false,
      source: "mock",
      campaignId: params.campaignId,
      account,
      dateRange,
      message: `Campaign "${params.campaignId}" was not found in the current account snapshot.`,
    };
  }

  const campaign = enrichCampaignListItem(mapRawCampaignToNormalized(raw, account.id));
  const metrics = buildCampaignMetrics(campaign);
  const tips = DETAIL_TIPS[params.campaignId] ?? DEFAULT_DETAIL_TIPS;

  return {
    found: true,
    source: "mock",
    account,
    dateRange,
    campaign,
    metrics,
    schedule: {
      startDate: campaign.startDate ?? null,
      endDate: campaign.endDate ?? null,
    },
    dailyTrend: mapDailyTrend(campaign),
    adSets: mapAdSets(params.campaignId),
    creatives: mapCreatives(params.campaignId),
    insights: tips.map(toReadOnlyInsight),
    warnings: buildCampaignWarnings(campaign, metrics),
    dataCompleteness: resolveDataCompleteness(campaign, metrics),
    readOnlyNotice: CAMPAIGN_DETAIL_READ_ONLY_NOTICE,
    metaAdsManagerUrl: buildMetaAdsManagerPlaceholder(account.metaAdAccountId),
  };
}
