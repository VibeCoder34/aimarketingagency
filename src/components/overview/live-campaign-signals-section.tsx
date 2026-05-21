"use client";

import type { OverviewCampaignInsightRow, OverviewCampaignSignals } from "@/lib/data/types";
import { OverviewCard } from "@/components/overview/overview-shell";
import { Badge } from "@/components/ui/badge";
import { formatCtrPercentagePoints } from "@/lib/metrics/ctr";
import { formatCurrency, formatNumber } from "@/lib/utils";

function ctrDisplay(ctr: number): string {
  return formatCtrPercentagePoints(ctr, 2);
}

function resultsLabel(signals: OverviewCampaignSignals): string {
  if (signals.resultMode === "lead") return "Leads";
  if (signals.resultMode === "purchase") return "Purchases";
  return "Results";
}

function formatResults(row: OverviewCampaignInsightRow, signals: OverviewCampaignSignals): string {
  if (signals.resultMode === "lead") {
    return row.leads != null ? formatNumber(row.leads) : "—";
  }
  if (signals.resultMode === "purchase") {
    return row.purchases != null ? formatNumber(row.purchases) : "—";
  }
  return row.results != null ? formatNumber(row.results) : "—";
}

function formatEfficiency(
  row: OverviewCampaignInsightRow,
  signals: OverviewCampaignSignals,
): string {
  if (signals.resultMode === "lead" && row.costPerLead != null) {
    return formatCurrency(row.costPerLead);
  }
  if (signals.resultMode === "purchase") {
    if (row.roas != null && row.roas > 0) return `${row.roas.toFixed(2)}x`;
    if (row.costPerPurchase != null) return formatCurrency(row.costPerPurchase);
  }
  if (row.roas != null && row.roas > 0) return `${row.roas.toFixed(2)}x`;
  return "—";
}

function efficiencyHeader(signals: OverviewCampaignSignals): string {
  if (signals.resultMode === "lead") return "Cost / lead";
  if (signals.resultMode === "purchase" && signals.purchaseRoasAvailable) return "ROAS / CPA";
  return "Efficiency";
}

function SignalList({
  title,
  subtitle,
  rows,
  signals,
  emptyText = "None in this period.",
}: {
  title: string;
  subtitle?: string;
  rows: OverviewCampaignInsightRow[];
  signals: OverviewCampaignSignals;
  emptyText?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p> : null}
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">{emptyText}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
                <th className="pb-2 pr-3 font-medium">Campaign</th>
                <th className="pb-2 pr-3 font-medium">Spend</th>
                <th className="pb-2 pr-3 font-medium">{resultsLabel(signals)}</th>
                <th className="pb-2 pr-3 font-medium">CTR</th>
                <th className="pb-2 pr-3 font-medium">Freq.</th>
                <th className="pb-2 font-medium">{efficiencyHeader(signals)}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.campaignId} className="border-b border-zinc-100 last:border-0">
                  <td className="max-w-[200px] truncate py-2 pr-3 font-medium text-zinc-900">
                    {row.campaignName}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-zinc-700">
                    {formatCurrency(row.spend)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-zinc-700">
                    {formatResults(row, signals)}
                  </td>
                  <td className="py-2 pr-3 tabular-nums text-zinc-700">{ctrDisplay(row.ctr)}</td>
                  <td className="py-2 pr-3 tabular-nums text-zinc-700">
                    {row.frequency.toFixed(2)}
                  </td>
                  <td className="py-2 tabular-nums text-zinc-700">
                    {formatEfficiency(row, signals)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LiveCampaignSignalsSection({
  signals,
}: {
  signals: OverviewCampaignSignals;
}) {
  if (!signals.available) {
    return (
      <OverviewCard
        title="Campaign signals"
        subtitle="From cached Meta campaign insights"
      >
        <p className="text-sm text-zinc-600">
          {signals.emptyMessage ??
            "No campaign-level data synced yet. Run reporting sync with campaign_insights."}
        </p>
      </OverviewCard>
    );
  }

  return (
    <OverviewCard
      title="Campaign signals"
      subtitle="From cached Meta campaign insights · apply changes in Meta Ads Manager"
    >
      <CampaignSignalsHeader signals={signals} />

      <CampaignSignalsLists signals={signals} />
    </OverviewCard>
  );
}

function CampaignSignalsHeader({ signals }: { signals: OverviewCampaignSignals }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {signals.resultMode === "lead" && signals.leadBasedLabel ? (
        <Badge variant="success">{signals.leadBasedLabel}</Badge>
      ) : null}
      {!signals.purchaseRoasAvailable && signals.purchaseUnavailableLabel ? (
        <Badge variant="warning">{signals.purchaseUnavailableLabel}</Badge>
      ) : null}
      <span className="text-xs text-zinc-500">
        {signals.campaigns.length} campaign{signals.campaigns.length === 1 ? "" : "s"} in cache
      </span>
    </div>
  );
}

function CampaignSignalsLists({ signals }: { signals: OverviewCampaignSignals }) {
  return (
    <div className="space-y-4">
      <SignalList
        title="Top spending campaigns"
        rows={signals.topSpending}
        signals={signals}
        emptyText="No campaigns with spend in this range."
      />

      {signals.bestLeads.length > 0 || signals.resultMode === "lead" ? (
        <SignalList
          title="Best lead campaigns"
          subtitle="Ranked by lead volume, then cost per lead"
          rows={signals.bestLeads}
          signals={signals}
          emptyText="No campaigns with attributed leads."
        />
      ) : null}

      <SignalList
        title="High spend, no results"
        subtitle={`Spend ≥ ${formatCurrency(50)} with zero leads/purchases`}
        rows={signals.highSpendNoResults}
        signals={signals}
        emptyText="No high-spend campaigns without results."
      />

      <SignalList
        title="Low CTR campaigns"
        subtitle="CTR below 0.5% with delivery"
        rows={signals.lowCtr}
        signals={signals}
        emptyText="No low-CTR campaigns flagged."
      />

      <SignalList
        title="High frequency campaigns"
        subtitle="Frequency ≥ 2.5 — possible audience fatigue"
        rows={signals.highFrequency}
        signals={signals}
        emptyText="No high-frequency campaigns flagged."
      />
    </div>
  );
}
