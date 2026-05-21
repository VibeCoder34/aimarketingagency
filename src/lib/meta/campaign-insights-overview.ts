import type { MetaCampaignInsightDbRow } from "@/lib/meta/campaign-insights-queries";
import type {
  OverviewCampaignInsightRow,
  OverviewCampaignSignals,
  OverviewCampaignSignalsResultMode,
} from "@/lib/data/types";
import type { ReportingInsightMetrics } from "@/lib/meta/sync/types";

/** CTR below this threshold (percentage points) flags low-CTR campaigns. */
const LOW_CTR_PERCENTAGE_POINTS = 0.5;
const HIGH_FREQUENCY = 2.5;
const MIN_SPEND_FOR_LIST = 1;
const HIGH_SPEND_NO_RESULTS = 50;
const LIST_LIMIT = 5;

function coerceMetrics(raw: unknown): ReportingInsightMetrics | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as ReportingInsightMetrics;
}

function detectResultMode(rows: OverviewCampaignInsightRow[]): {
  mode: OverviewCampaignSignalsResultMode;
  purchaseRoasAvailable: boolean;
} {
  const hasPurchases = rows.some((r) => (r.purchases ?? 0) > 0);
  const hasLeads = rows.some((r) => (r.leads ?? 0) > 0);
  const hasRoas = rows.some((r) => r.roas != null && r.roas > 0);
  const hasConversionValue = rows.some((r) => (r.conversionValue ?? 0) > 0);

  if (hasPurchases || (hasRoas && hasConversionValue)) {
    return { mode: "purchase", purchaseRoasAvailable: true };
  }
  if (hasLeads) {
    return { mode: "lead", purchaseRoasAvailable: false };
  }
  return { mode: "traffic", purchaseRoasAvailable: false };
}

export function normalizeCampaignInsightRow(
  row: MetaCampaignInsightDbRow,
  accountId: string,
): OverviewCampaignInsightRow {
  const m = coerceMetrics(row.metrics) ?? {
    spend: 0,
    impressions: 0,
    reach: 0,
    frequency: 0,
    clicks: 0,
    ctr: 0,
    cpc: 0,
    cpm: 0,
    purchases: null,
    leads: null,
    addToCart: null,
    initiateCheckout: null,
    viewContent: null,
    landingPageView: null,
    linkClick: null,
    conversionValue: null,
    purchaseValue: null,
    costPerPurchase: null,
    costPerLead: null,
    roas: null,
    websitePurchaseRoas: null,
    results: null,
    costPerResult: null,
    conversionMetricsAvailable: false,
  };

  const purchases = m.purchases;
  const leads = m.leads;
  const hasPurchases = (purchases ?? 0) > 0;
  const hasLeads = (leads ?? 0) > 0;

  let resultType: OverviewCampaignInsightRow["resultType"] = "none";
  let results: number | null = null;

  if (hasPurchases) {
    resultType = "purchase";
    results = purchases;
  } else if (hasLeads) {
    resultType = "lead";
    results = leads;
  }

  return {
    campaignId: row.campaign_id,
    campaignName: row.campaign_name ?? row.campaign_id,
    accountId,
    spend: m.spend,
    impressions: m.impressions,
    clicks: m.clicks,
    ctr: m.ctr,
    cpc: m.cpc,
    cpm: m.cpm,
    frequency: m.frequency,
    leads,
    purchases,
    costPerLead: m.costPerLead,
    costPerPurchase: m.costPerPurchase,
    roas: m.roas,
    conversionValue: m.conversionValue,
    results,
    resultType,
  };
}

function topBySpend(rows: OverviewCampaignInsightRow[]): OverviewCampaignInsightRow[] {
  return [...rows]
    .filter((r) => r.spend >= MIN_SPEND_FOR_LIST)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, LIST_LIMIT);
}

function bestLeadCampaigns(rows: OverviewCampaignInsightRow[]): OverviewCampaignInsightRow[] {
  return [...rows]
    .filter((r) => (r.leads ?? 0) > 0)
    .sort((a, b) => {
      const leadDiff = (b.leads ?? 0) - (a.leads ?? 0);
      if (leadDiff !== 0) return leadDiff;
      const cplA = a.costPerLead ?? Number.POSITIVE_INFINITY;
      const cplB = b.costPerLead ?? Number.POSITIVE_INFINITY;
      return cplA - cplB;
    })
    .slice(0, LIST_LIMIT);
}

function highSpendNoResults(rows: OverviewCampaignInsightRow[]): OverviewCampaignInsightRow[] {
  return [...rows]
    .filter(
      (r) =>
        r.spend >= HIGH_SPEND_NO_RESULTS &&
        (r.results == null || r.results === 0),
    )
    .sort((a, b) => b.spend - a.spend)
    .slice(0, LIST_LIMIT);
}

function lowCtrCampaigns(rows: OverviewCampaignInsightRow[]): OverviewCampaignInsightRow[] {
  return [...rows]
    .filter((r) => r.spend >= MIN_SPEND_FOR_LIST && r.ctr < LOW_CTR_PERCENTAGE_POINTS)
    .sort((a, b) => a.ctr - b.ctr)
    .slice(0, LIST_LIMIT);
}

function highFrequencyCampaigns(rows: OverviewCampaignInsightRow[]): OverviewCampaignInsightRow[] {
  return [...rows]
    .filter((r) => r.spend >= MIN_SPEND_FOR_LIST && r.frequency >= HIGH_FREQUENCY)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, LIST_LIMIT);
}

export function buildOverviewCampaignSignals(
  dbRows: MetaCampaignInsightDbRow[],
  accountId: string,
): OverviewCampaignSignals {
  if (dbRows.length === 0) {
    return {
      available: false,
      resultMode: "traffic",
      purchaseRoasAvailable: false,
      campaigns: [],
      topSpending: [],
      bestLeads: [],
      highSpendNoResults: [],
      lowCtr: [],
      highFrequency: [],
      emptyMessage:
        "No campaign insights in cache for this date range. Run reporting sync with campaign_insights enabled.",
    };
  }

  const campaigns = dbRows.map((row) => normalizeCampaignInsightRow(row, accountId));
  const { mode, purchaseRoasAvailable } = detectResultMode(campaigns);

  const bestLeads = mode === "lead" || campaigns.some((c) => (c.leads ?? 0) > 0)
    ? bestLeadCampaigns(campaigns)
    : [];

  return {
    available: true,
    resultMode: mode,
    purchaseRoasAvailable,
    campaigns,
    topSpending: topBySpend(campaigns),
    bestLeads,
    highSpendNoResults: highSpendNoResults(campaigns),
    lowCtr: lowCtrCampaigns(campaigns),
    highFrequency: highFrequencyCampaigns(campaigns),
    leadBasedLabel: mode === "lead" ? "Lead-based performance" : undefined,
    purchaseUnavailableLabel:
      !purchaseRoasAvailable
        ? "Purchase/ROAS data not available for this account/range"
        : undefined,
  };
}
