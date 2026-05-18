import type { AIContextPayload, OverviewData } from "@/lib/data/types";

const READ_ONLY_DISCLAIMER =
  "AdPilot is read-only. Recommendations are for manual review in Meta Ads Manager only.";

/** Builds an AI-ready context object from normalized overview data (no LLM calls). */
export function buildAIContextPayload(data: OverviewData): AIContextPayload {
  return {
    source: data.source,
    generatedAt: new Date().toISOString(),
    account: {
      id: data.account.id,
      name: data.account.name,
      currency: data.account.currency,
      dateRange: data.dateRange,
    },
    accountSummary: {
      healthStatus: data.health.status,
      healthLabel: data.health.statusLabel,
      explanation: data.health.explanation,
    },
    kpiSummary: data.kpis.map((k) => ({
      label: k.label,
      value: k.value,
      valueMode: k.valueMode,
      deltaPercent: k.deltaPercent,
      deltaDirection: k.deltaDirection,
    })),
    campaignSignals: data.campaigns.map((c) => ({
      campaignId: c.id,
      campaignName: c.name,
      signal: c.signal,
      roas: c.roas,
      spend: c.spend,
      status: c.status,
    })),
    recommendedActions: data.recommendations,
    dataCoverage: data.dataCoverage,
    alerts: data.alerts,
    budgetPacing: {
      spent: data.budgetPacing.spent,
      total: data.budgetPacing.total,
      percent: data.budgetPacing.percent,
      status: data.budgetPacing.status,
      statusLabel: data.budgetPacing.statusLabel,
      projectedMonthEndSpend: data.budgetPacing.projectedMonthEndSpend,
      daysRemaining: data.budgetPacing.daysRemaining,
    },
    readOnlyDisclaimer: READ_ONLY_DISCLAIMER,
  };
}
