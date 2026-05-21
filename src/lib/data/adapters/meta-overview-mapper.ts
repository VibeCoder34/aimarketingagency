import type { ConnectedMetaAdAccountRow } from "@/lib/meta/queries";
import { formatRelativeTimeAgo } from "@/lib/meta/format-relative-time";
import {
  labelForOverviewDatePreset,
  META_OVERVIEW_DEFAULT_DATE_PRESET,
} from "@/lib/meta/overview-date-presets";
import { CONVERSION_DATA_MISSING_MESSAGE } from "@/lib/meta/overview-actions";
import { buildOverviewFunnelMetrics } from "@/lib/meta/overview-funnel";
import type { MetaOverviewMetrics } from "@/lib/meta/overview-metrics";
import type { MetaOverviewSnapshotRow } from "@/lib/meta/overview-snapshots";
import type {
  AccountHealth,
  AccountOverviewContext,
  DataCoverageScore,
  DateRange,
  NormalizedAccount,
  OverviewCampaignSignals,
  OverviewData,
  OverviewKpi,
  OverviewPerformance,
  WhatChangedItem,
} from "@/lib/data/types";

function formatDateRangeLabel(start: string, end: string): string {
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  return `${startDate.toLocaleDateString("en-US", opts)} – ${endDate.toLocaleDateString("en-US", opts)}`;
}

function metricsToPerformance(metrics: MetaOverviewMetrics): OverviewPerformance {
  const funnelMetrics = buildOverviewFunnelMetrics(metrics);
  return {
    results: metrics.results,
    resultType: metrics.resultTypeLabel,
    costPerResult: metrics.costPerResult,
    conversionValue: metrics.conversionValue,
    roas: metrics.roas,
    purchases: metrics.purchases,
    leads: metrics.leads,
    addToCart: metrics.addToCart,
    initiateCheckout: metrics.initiateCheckout,
    viewContent: metrics.viewContent,
    landingPageViews: metrics.landingPageViews,
    funnelMetrics,
    hasConversionData: metrics.hasConversionData,
    conversionCoverageMessage: metrics.hasConversionData ? undefined : CONVERSION_DATA_MISSING_MESSAGE,
  };
}

function buildMetaKpis(metrics: MetaOverviewMetrics, currency: string): OverviewKpi[] {
  const hasConv = metrics.hasConversionData;
  const resultLabel = metrics.resultTypeLabel ?? "Results";
  const showRoasPrimary =
    metrics.roas != null && metrics.roas > 0 && (metrics.conversionValue ?? 0) > 0;

  const primary: OverviewKpi[] = [
    {
      id: "spend",
      label: "Spend",
      value: metrics.spend,
      valueMode: "currency",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: `Total spend in ${currency} for the selected period.`,
      tier: "primary",
      available: true,
    },
    {
      id: "results",
      label: resultLabel,
      value: metrics.results ?? 0,
      valueMode: "number",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: hasConv
        ? `Primary outcome: ${resultLabel.toLowerCase()} attributed in this period.`
        : "No conversion outcomes returned for this range.",
      tier: "primary",
      available: hasConv && metrics.results != null,
      unavailableReason: CONVERSION_DATA_MISSING_MESSAGE,
    },
    {
      id: "costPerResult",
      label: "Cost per Result",
      value: metrics.costPerResult ?? 0,
      valueMode: "currency",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: hasConv
        ? `Average cost per ${resultLabel.toLowerCase().replace(/s$/, "")}.`
        : "Requires attributed conversion events.",
      tier: "primary",
      invertDelta: true,
      available: hasConv && metrics.costPerResult != null,
      unavailableReason: CONVERSION_DATA_MISSING_MESSAGE,
    },
    showRoasPrimary
      ? {
          id: "roas",
          label: "ROAS",
          value: metrics.roas ?? 0,
          valueMode: "ratio",
          deltaPercent: 0,
          deltaDirection: "neutral",
          interpretation: `Return on ad spend · ${currency} ${(metrics.conversionValue ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} conversion value.`,
          tier: "primary",
          invertDelta: false,
          available: true,
        }
      : {
          id: "conversionValue",
          label: "Conversion Value",
          value: metrics.conversionValue ?? 0,
          valueMode: "currency",
          deltaPercent: 0,
          deltaDirection: "neutral",
          interpretation: hasConv
            ? "Attributed purchase/conversion value from Meta."
            : "Conversion value not returned for this range.",
          tier: "primary",
          available: hasConv && (metrics.conversionValue ?? 0) > 0,
          unavailableReason: CONVERSION_DATA_MISSING_MESSAGE,
        },
  ];

  const secondary: OverviewKpi[] = [
    {
      id: "ctr",
      label: "CTR",
      value: metrics.ctr,
      valueMode: "percent_points",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: "Click-through rate.",
      tier: "secondary",
    },
    {
      id: "cpc",
      label: "CPC",
      value: metrics.cpc,
      valueMode: "currency",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: "Cost per click.",
      tier: "secondary",
      invertDelta: true,
    },
    {
      id: "cpm",
      label: "CPM",
      value: metrics.cpm,
      valueMode: "currency",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation: "Cost per 1,000 impressions.",
      tier: "secondary",
      invertDelta: true,
    },
    {
      id: "frequency",
      label: "Frequency",
      value: metrics.frequency,
      valueMode: "number",
      deltaPercent: 0,
      deltaDirection: "neutral",
      interpretation:
        metrics.reach > 0
          ? `Reach ${metrics.reach.toLocaleString("en-US")} in period.`
          : "Average impressions per reached user.",
      tier: "secondary",
    },
  ];

  return [...primary, ...secondary];
}

function buildMetaDataCoverage(metrics: MetaOverviewMetrics): DataCoverageScore[] {
  const convStatus = metrics.hasConversionData ? ("available" as const) : ("missing" as const);
  const roasStatus =
    metrics.roas != null && metrics.roas > 0
      ? ("available" as const)
      : metrics.hasConversionData
        ? ("partial" as const)
        : ("missing" as const);

  return [
    { id: "spend", label: "Spend", status: "available" },
    { id: "impressions", label: "Impressions", status: "available" },
    { id: "clicks", label: "Clicks", status: "available" },
    { id: "ctr", label: "CTR / CPC / CPM", status: "available" },
    { id: "reach", label: "Reach & frequency", status: "available" },
    {
      id: "conversions",
      label: "Purchases & leads",
      status: convStatus,
      note: convStatus === "missing" ? CONVERSION_DATA_MISSING_MESSAGE : undefined,
    },
    {
      id: "roas",
      label: "ROAS & conversion value",
      status: roasStatus,
      note:
        roasStatus === "missing"
          ? "ROAS requires purchase value or purchase_roas from Meta."
          : undefined,
    },
    {
      id: "funnel",
      label: "Funnel events",
      status: metrics.hasConversionData ? "partial" : "missing",
      note: metrics.hasConversionData
        ? "Funnel steps depend on which Pixel events fired."
        : "Landing page, cart, and checkout events not returned.",
    },
    {
      id: "campaigns",
      label: "Campaign-level insights",
      status: "missing",
      note: "Campaign live data is coming in a future update.",
    },
    {
      id: "breakdowns",
      label: "Platform breakdown",
      status: "missing",
      note: "Publisher platform breakdown is not synced yet.",
    },
  ];
}

function buildPerformanceAccountHealth(metrics: MetaOverviewMetrics): AccountHealth {
  const hasTraffic = metrics.impressions > 0 || metrics.spend > 0;
  if (!hasTraffic) {
    return {
      status: "needs_attention",
      statusLabel: "No delivery",
      explanation:
        "Meta returned no spend or impressions for this date range. Try a wider range (e.g. All time) or confirm the account has run ads.",
      chips: [{ label: "Empty period", variant: "warning" }],
    };
  }

  if (!metrics.hasConversionData) {
    return {
      status: "needs_attention",
      statusLabel: "Traffic only",
      explanation:
        "Delivery is active but conversion events were not returned. Check Pixel/CAPI setup and refresh after events are firing.",
      chips: [
        { label: "Live Meta data", variant: "success" },
        { label: "No conversion data", variant: "warning" },
      ],
    };
  }

  if (metrics.roas != null && metrics.roas > 0 && metrics.roas < 1) {
    return {
      status: "at_risk",
      statusLabel: "ROAS below 1x",
      explanation: `Spend is not fully recovered by attributed conversion value (ROAS ${metrics.roas.toFixed(2)}x). Review creative, offer, and landing experience.`,
      chips: [
        { label: "Conversions tracked", variant: "success" },
        { label: "ROAS < 1x", variant: "danger" },
      ],
    };
  }

  if (metrics.ctr < 0.5) {
    return {
      status: "needs_attention",
      statusLabel: "Watch CTR",
      explanation: "CTR is below typical prospecting benchmarks — review creative and targeting in Meta.",
      chips: [
        { label: "Live performance data", variant: "success" },
        { label: "CTR below 0.5%", variant: "warning" },
      ],
    };
  }

  return {
    status: "healthy",
    statusLabel: "Performance stable",
    explanation: metrics.resultTypeLabel
      ? `${metrics.resultTypeLabel} and traffic metrics look stable for the selected period.`
      : "Account metrics look stable for the selected period.",
    chips: [{ label: "Live Meta data", variant: "success" }],
  };
}

function buildUnavailableWhatChanged(): WhatChangedItem[] {
  return [
    {
      id: "historical",
      label: "Period comparison",
      deltaPercent: 0,
      deltaDirection: "neutral",
      explanation: "Not enough historical data yet. Comparisons will appear after multiple syncs.",
    },
  ];
}

function buildMetaContext(
  account: ConnectedMetaAdAccountRow,
  dateRange: DateRange,
  syncedAt: string | null,
  canRefreshData: boolean,
): AccountOverviewContext {
  return {
    accountName: account.meta_ad_account_name,
    dateRangeLabel: dateRange.label ?? labelForOverviewDatePreset(META_OVERVIEW_DEFAULT_DATE_PRESET),
    dateRangeDetail: dateRange.detailLabel ?? "",
    lastSyncedAgo: formatRelativeTimeAgo(syncedAt),
    dataSourceLabel: "live_meta",
    dataSourceBadge: "Live Meta data",
    canRefreshData,
    connectedMetaAdAccountUuid: account.id,
    metaAdAccountId: account.meta_ad_account_id,
    dateRangePreset: dateRange.preset,
  };
}

function buildMetaAccount(account: ConnectedMetaAdAccountRow): NormalizedAccount {
  return {
    id: account.id,
    name: account.meta_ad_account_name,
    currency: account.currency ?? "USD",
    metaAdAccountId: account.meta_ad_account_id,
    monthlyBudget: undefined,
  };
}

function buildMetaDateRange(snapshot: MetaOverviewSnapshotRow): DateRange {
  const detailLabel = formatDateRangeLabel(snapshot.date_start, snapshot.date_end);
  const presetLabel = labelForOverviewDatePreset(
    snapshot.date_range_preset as Parameters<typeof labelForOverviewDatePreset>[0],
  );
  return {
    preset: snapshot.date_range_preset,
    start: snapshot.date_start,
    end: snapshot.date_end,
    label: presetLabel,
    detailLabel,
  };
}

export function mapMetaSnapshotToOverviewData(
  snapshot: MetaOverviewSnapshotRow,
  account: ConnectedMetaAdAccountRow,
  canRefreshData: boolean,
  campaignSignals?: OverviewCampaignSignals | null,
): OverviewData {
  const metrics = snapshot.metrics;
  const dateRange = buildMetaDateRange(snapshot);
  const normalizedAccount = buildMetaAccount(account);
  const performance = metricsToPerformance(metrics);

  return {
    source: "meta",
    displayMode: "full",
    account: normalizedAccount,
    dateRange,
    context: buildMetaContext(account, dateRange, snapshot.synced_at, canRefreshData),
    health: buildPerformanceAccountHealth(metrics),
    kpis: buildMetaKpis(metrics, normalizedAccount.currency),
    performance,
    dailyInsights: [],
    spendChartCaption: "Daily spend trends require time-series sync (coming next).",
    whatChanged: buildUnavailableWhatChanged(),
    campaigns: [],
    campaignSignals: campaignSignals ?? null,
    recommendations: [],
    budgetPacing: null,
    platformBreakdown: [],
    platformInsight: "Platform breakdown is not available until publisher-level sync is enabled.",
    dataCoverage: buildMetaDataCoverage(metrics),
    alerts: [],
    aiQuickActions: [
      { actionId: "ov-explain", label: "Explain performance (metrics + conversions)" },
      { actionId: "ov-risks", label: "Review delivery & ROAS signals" },
    ],
    sectionMessages: {
      campaigns: campaignSignals?.available
        ? undefined
        : "Run reporting sync with campaign_insights to load campaign signals.",
      recommendations: "Recommendations require campaign sync — not available yet.",
      budgetPacing: "Monthly budget pacing is not available without a known account budget.",
      spendChart: "Chart unavailable until daily insights are synced.",
    },
  };
}

export function buildMetaOverviewShell(
  account: ConnectedMetaAdAccountRow,
  displayMode: OverviewData["displayMode"],
  options: {
    bannerTitle: string;
    bannerMessage: string;
    syncedAt?: string | null;
    dateRange?: DateRange;
    canRefreshData?: boolean;
    dataSourceBadge?: string;
  },
): OverviewData {
  const dateRange: DateRange = options.dateRange ?? {
    preset: META_OVERVIEW_DEFAULT_DATE_PRESET,
    start: "",
    end: "",
    label: labelForOverviewDatePreset(META_OVERVIEW_DEFAULT_DATE_PRESET),
    detailLabel: "Select refresh after your first sync",
  };

  const normalizedAccount = buildMetaAccount(account);

  return {
    source: "meta",
    displayMode,
    account: normalizedAccount,
    dateRange,
    context: {
      accountName: account.meta_ad_account_name,
      dateRangeLabel: dateRange.label ?? labelForOverviewDatePreset(META_OVERVIEW_DEFAULT_DATE_PRESET),
      dateRangeDetail: dateRange.detailLabel ?? "",
      lastSyncedAgo: formatRelativeTimeAgo(options.syncedAt),
      dataSourceLabel: "live_meta",
      dataSourceBadge: options.dataSourceBadge ?? "Live Meta data",
      canRefreshData: options.canRefreshData ?? displayMode === "no_snapshot",
      connectedMetaAdAccountUuid: account.id,
      metaAdAccountId: account.meta_ad_account_id,
      dateRangePreset: dateRange.preset,
      bannerTitle: options.bannerTitle,
      bannerMessage: options.bannerMessage,
    },
    health: {
      status: "needs_attention",
      statusLabel: "Awaiting data",
      explanation: options.bannerMessage,
      chips: [{ label: "Meta connected", variant: "default" }],
    },
    kpis: [],
    performance: null,
    dailyInsights: [],
    spendChartCaption: "No synced chart data yet.",
    whatChanged: buildUnavailableWhatChanged(),
    campaigns: [],
    recommendations: [],
    budgetPacing: null,
    platformBreakdown: [],
    platformInsight: "Platform breakdown unavailable.",
    dataCoverage: buildMetaDataCoverage({
      spend: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      reach: 0,
      frequency: 0,
      results: null,
      resultType: "none",
      resultTypeLabel: null,
      costPerResult: null,
      conversionValue: null,
      roas: null,
      purchases: null,
      leads: null,
      addToCart: null,
      initiateCheckout: null,
      viewContent: null,
      landingPageViews: null,
      completeRegistration: null,
      linkClicks: null,
      purchaseRoas: null,
      websitePurchaseRoas: null,
      costPerPurchase: null,
      costPerLead: null,
      costPerAddToCart: null,
      costPerInitiateCheckout: null,
      hasConversionData: false,
    }).map((item) =>
      item.id === "spend" || item.id === "impressions"
        ? { ...item, status: "missing" as const, note: "Refresh to load live metrics." }
        : item,
    ),
    alerts: [],
    aiQuickActions: [],
    sectionMessages: {
      campaigns: options.bannerMessage,
      recommendations: "Unavailable until overview metrics are synced.",
      budgetPacing: "Unavailable until account budget is known.",
      spendChart: "Unavailable until data is synced.",
    },
  };
}
