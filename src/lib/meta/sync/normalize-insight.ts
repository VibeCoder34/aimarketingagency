import { hasAnyConversionSignal, normalizeMetaActions, normalizeMetaActionValues } from "@/lib/meta/overview-actions";
import { normalizeMetaOverviewMetrics, type MetaOverviewInsightRow } from "@/lib/meta/overview-metrics";
import type { MetaReportingInsightRow, ReportingInsightMetrics } from "@/lib/meta/sync/types";

export function normalizeReportingInsightRow(
  row: MetaReportingInsightRow,
  options?: { conversionMetricsAvailable?: boolean },
): ReportingInsightMetrics {
  const asOverviewRow = row as MetaOverviewInsightRow;
  const base = normalizeMetaOverviewMetrics(asOverviewRow);
  const actions = normalizeMetaActions(row.actions ?? row.conversions);
  const values = normalizeMetaActionValues({
    actionValues: row.action_values ?? row.conversion_values,
    purchaseRoas: row.purchase_roas,
    websitePurchaseRoas: row.website_purchase_roas,
    costPerActionType: row.cost_per_action_type,
  });

  const conversionMetricsAvailable =
    options?.conversionMetricsAvailable ??
    (hasAnyConversionSignal(actions, values) || base.hasConversionData);

  return {
    spend: base.spend,
    impressions: base.impressions,
    reach: base.reach,
    frequency: base.frequency,
    clicks: base.clicks,
    ctr: base.ctr,
    cpc: base.cpc,
    cpm: base.cpm,
    purchases: base.purchases,
    leads: base.leads,
    addToCart: base.addToCart,
    initiateCheckout: base.initiateCheckout,
    viewContent: base.viewContent,
    landingPageView: base.landingPageViews,
    linkClick: base.linkClicks,
    conversionValue: base.conversionValue,
    purchaseValue: values.purchaseValue ?? base.conversionValue,
    costPerPurchase: base.costPerPurchase,
    costPerLead: base.costPerLead,
    roas: base.roas,
    websitePurchaseRoas: base.websitePurchaseRoas,
    results: base.results,
    costPerResult: base.costPerResult,
    conversionMetricsAvailable,
  };
}

export function inferDateBounds(
  rows: MetaReportingInsightRow[],
  fallback: { start: string; end: string },
): { start: string; end: string } {
  if (rows.length === 0) return fallback;
  let min = rows[0]?.date_start ?? fallback.start;
  let max = rows[0]?.date_stop ?? fallback.end;
  for (const row of rows) {
    if (row.date_start && row.date_start < min) min = row.date_start;
    if (row.date_stop && row.date_stop > max) max = row.date_stop;
  }
  return { start: min, end: max };
}
