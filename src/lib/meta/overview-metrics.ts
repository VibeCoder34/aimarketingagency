export { META_OVERVIEW_DEFAULT_DATE_PRESET as META_OVERVIEW_DATE_PRESET } from "@/lib/meta/overview-date-presets";

import { normalizeMetaCtr, parseMetricNumber } from "@/lib/metrics/ctr";
import type { MetaInsightActionEntry } from "@/lib/meta/overview-actions";
import {
  hasAnyConversionSignal,
  normalizeMetaActionValues,
  normalizeMetaActions,
  resolvePrimaryResultType,
  type MetaResultType,
  type NormalizedMetaActionValues,
  type NormalizedMetaActions,
} from "@/lib/meta/overview-actions";

export type { MetaInsightActionEntry, MetaResultType, NormalizedMetaActions, NormalizedMetaActionValues };

/** Traffic + performance metrics stored in meta_overview_snapshots.metrics (jsonb). */
export type MetaOverviewMetrics = {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  reach: number;
  frequency: number;
  /** Primary conversion count (purchases, leads, etc.) */
  results: number | null;
  resultType: MetaResultType;
  resultTypeLabel: string | null;
  costPerResult: number | null;
  conversionValue: number | null;
  roas: number | null;
  purchases: number | null;
  leads: number | null;
  addToCart: number | null;
  initiateCheckout: number | null;
  viewContent: number | null;
  landingPageViews: number | null;
  completeRegistration: number | null;
  linkClicks: number | null;
  purchaseRoas: number | null;
  websitePurchaseRoas: number | null;
  costPerPurchase: number | null;
  costPerLead: number | null;
  costPerAddToCart: number | null;
  costPerInitiateCheckout: number | null;
  hasConversionData: boolean;
};

export type MetaOverviewInsightRow = {
  spend?: string;
  impressions?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  reach?: string;
  frequency?: string;
  date_start?: string;
  date_stop?: string;
  actions?: MetaInsightActionEntry[];
  action_values?: MetaInsightActionEntry[];
  cost_per_action_type?: MetaInsightActionEntry[];
  purchase_roas?: MetaInsightActionEntry[];
  website_purchase_roas?: MetaInsightActionEntry[];
  conversions?: MetaInsightActionEntry[];
  conversion_values?: MetaInsightActionEntry[];
};

function parseMetric(value: string | undefined): number {
  return parseMetricNumber(value);
}

function computeCostPerResult(spend: number, results: number | null): number | null {
  if (results == null || results <= 0 || spend <= 0) return null;
  return spend / results;
}

function computeRoas(conversionValue: number | null, spend: number): number | null {
  if (conversionValue == null || conversionValue <= 0 || spend <= 0) return null;
  return conversionValue / spend;
}

function resolveRoas(
  values: NormalizedMetaActionValues,
  conversionValue: number | null,
  spend: number,
): number | null {
  if (values.websitePurchaseRoas != null && values.websitePurchaseRoas > 0) {
    return values.websitePurchaseRoas;
  }
  if (values.purchaseRoas != null && values.purchaseRoas > 0) {
    return values.purchaseRoas;
  }
  return computeRoas(conversionValue, spend);
}

function resolveCostPerResult(
  primary: ReturnType<typeof resolvePrimaryResultType>,
  values: NormalizedMetaActionValues,
  spend: number,
): number | null {
  if (primary.resultType === "purchase" && values.costPerPurchase != null) {
    return values.costPerPurchase;
  }
  if (primary.resultType === "lead" && values.costPerLead != null) {
    return values.costPerLead;
  }
  if (primary.resultType === "add_to_cart" && values.costPerAddToCart != null) {
    return values.costPerAddToCart;
  }
  return computeCostPerResult(spend, primary.results);
}

export function normalizeMetaOverviewMetrics(row: MetaOverviewInsightRow): MetaOverviewMetrics {
  const spend = parseMetric(row.spend);
  const impressions = parseMetric(row.impressions);
  const clicks = parseMetric(row.clicks);
  const actions = normalizeMetaActions(row.actions ?? row.conversions);
  const actionValues = normalizeMetaActionValues({
    actionValues: row.action_values ?? row.conversion_values,
    purchaseRoas: row.purchase_roas,
    websitePurchaseRoas: row.website_purchase_roas,
    costPerActionType: row.cost_per_action_type,
  });

  const primary = resolvePrimaryResultType(actions);
  const conversionValue = actionValues.purchaseValue ?? actionValues.leadValue;
  const roas = resolveRoas(actionValues, conversionValue, spend);
  const costPerResult = resolveCostPerResult(primary, actionValues, spend);
  const hasConversionData = hasAnyConversionSignal(actions, actionValues);

  return {
    spend,
    impressions,
    clicks,
    ctr: normalizeMetaCtr(row.ctr, { clicks, impressions }),
    cpc: parseMetric(row.cpc),
    cpm: parseMetric(row.cpm),
    reach: parseMetric(row.reach),
    frequency: parseMetric(row.frequency),
    results: primary.results,
    resultType: primary.resultType,
    resultTypeLabel: primary.resultTypeLabel,
    costPerResult,
    conversionValue,
    roas,
    purchases: actions.purchase,
    leads: actions.lead,
    addToCart: actions.addToCart,
    initiateCheckout: actions.initiateCheckout,
    viewContent: actions.viewContent,
    landingPageViews: actions.landingPageView,
    completeRegistration: actions.completeRegistration,
    linkClicks: actions.linkClick,
    purchaseRoas: actionValues.purchaseRoas,
    websitePurchaseRoas: actionValues.websitePurchaseRoas,
    costPerPurchase: actionValues.costPerPurchase,
    costPerLead: actionValues.costPerLead,
    costPerAddToCart: actionValues.costPerAddToCart,
    costPerInitiateCheckout: actionValues.costPerInitiateCheckout,
    hasConversionData,
  };
}

export const EMPTY_META_OVERVIEW_METRICS: MetaOverviewMetrics = {
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
};

/** Ensures jsonb snapshots from before conversion sync still deserialize safely. */
export function coerceStoredMetaOverviewMetrics(
  raw: Partial<MetaOverviewMetrics> | null | undefined,
): MetaOverviewMetrics {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_META_OVERVIEW_METRICS };
  }
  return {
    ...EMPTY_META_OVERVIEW_METRICS,
    ...raw,
    hasConversionData: raw.hasConversionData ?? false,
    resultType: raw.resultType ?? "none",
  };
}
