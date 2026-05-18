"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import type { CampaignsData } from "@/lib/data/types";
import {
  DEFAULT_CAMPAIGN_FILTERS,
  filterAndSortCampaigns,
  type CampaignListFilters,
  type CampaignObjectiveFilter,
  type CampaignSortKey,
  type CampaignStatusFilter,
} from "@/lib/data/campaigns-query";
import {
  getCampaignSignalLabel,
  getCampaignSignalVariant,
} from "@/lib/data/campaign-signals";
import { CampaignDetailPanel } from "@/components/campaigns/campaign-detail-panel";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import { PageActions } from "@/components/pages/page-actions";
import { FilterChips } from "@/components/ui/filter-chips";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { NormalizedCampaignStatus } from "@/lib/data/types";

function healthEmoji(score: number | null | undefined) {
  if (score == null) return "—";
  if (score >= 80) return `${score}/100 🟢`;
  if (score >= 60) return `${score}/100 🟡`;
  return `${score}/100 🔴`;
}

function statusVariant(status: NormalizedCampaignStatus) {
  if (status === "active") return "success" as const;
  if (status === "paused" || status === "ended") return "warning" as const;
  if (status === "learning") return "muted" as const;
  return "danger" as const;
}

const STATUS_OPTIONS: { label: string; value: CampaignStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Learning", value: "learning" },
  { label: "Ended", value: "ended" },
];

const OBJECTIVE_OPTIONS: { label: string; value: CampaignObjectiveFilter }[] = [
  { label: "All", value: "all" },
  { label: "Conversions", value: "conversions" },
  { label: "Traffic", value: "traffic" },
  { label: "Awareness", value: "awareness" },
];

const SORT_OPTIONS: { label: string; value: CampaignSortKey }[] = [
  { label: "Highest ROAS", value: "highest_roas" },
  { label: "Highest Spend", value: "highest_spend" },
  { label: "Lowest ROAS", value: "lowest_roas" },
  { label: "Highest CPA", value: "highest_cpa" },
];

export type CampaignsTableProps = {
  data: CampaignsData;
};

export function CampaignsTable({ data }: CampaignsTableProps) {
  const { runInlineAction } = useAICompanion();
  const [filters, setFilters] = useState<CampaignListFilters>(DEFAULT_CAMPAIGN_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterAndSortCampaigns(data.campaigns, filters),
    [data.campaigns, filters],
  );

  const setStatus = (label: string) => {
    const match = STATUS_OPTIONS.find((o) => o.label === label);
    if (match) setFilters((f) => ({ ...f, status: match.value }));
  };

  const setObjective = (label: string) => {
    const match = OBJECTIVE_OPTIONS.find((o) => o.label === label);
    if (match) setFilters((f) => ({ ...f, objective: match.value }));
  };

  const statusLabel =
    STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? "All";
  const objectiveLabel =
    OBJECTIVE_OPTIONS.find((o) => o.value === filters.objective)?.label ?? "All";

  return (
    <>
      <PageActions showExport={false} />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--adpilot-text-muted)]">
              {data.context.accountName}
            </p>
            <p className="text-sm text-[var(--adpilot-text-muted)]">
              {data.context.dateRangeLabel} · Last synced {data.context.lastSyncedAgo}
            </p>
          </div>
          <Badge variant="muted">Read-only · mock data</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <FilterChips
            label="Status"
            options={STATUS_OPTIONS.map((o) => o.label)}
            value={statusLabel}
            onChange={setStatus}
          />
          <FilterChips
            label="Objective"
            options={OBJECTIVE_OPTIONS.map((o) => o.label)}
            value={objectiveLabel}
            onChange={setObjective}
          />
          <FilterChips
            label="Attention"
            options={["All campaigns", "Needs attention"]}
            value={filters.needsAttentionOnly ? "Needs attention" : "All campaigns"}
            onChange={(v) =>
              setFilters((f) => ({ ...f, needsAttentionOnly: v === "Needs attention" }))
            }
          />
          <input
            type="search"
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-3 py-1.5 text-sm"
          />
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sortBy: e.target.value as CampaignSortKey }))
            }
            className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-3 py-1.5 text-sm"
            aria-label="Sort campaigns"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                  <th className="py-2 pr-3 font-medium">Campaign</th>
                  <th className="py-2 pr-3 font-medium">Signal</th>
                  <th className="py-2 pr-3 font-medium">Objective</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Daily Budget</th>
                  <th className="py-2 pr-3 font-medium">Spend (MTD)</th>
                  <th className="py-2 pr-3 font-medium">Revenue</th>
                  <th className="py-2 pr-3 font-medium">ROAS</th>
                  <th className="py-2 pr-3 font-medium">CPA</th>
                  <th className="py-2 pr-3 font-medium">CPC</th>
                  <th className="py-2 pr-3 font-medium">CTR</th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      AI Health
                      <span title="Based on ROAS trend, CTR, fatigue, pacing, and saturation.">
                        <Info className="h-3.5 w-3.5" />
                      </span>
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">Manual action</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer border-b border-[var(--adpilot-border)] last:border-0 hover:bg-[var(--adpilot-nav-hover-bg)]"
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="max-w-[200px] py-2 pr-3 font-medium text-[var(--adpilot-text-primary)]">
                      {c.name}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant={getCampaignSignalVariant(c.signal)} className="whitespace-nowrap">
                        {getCampaignSignalLabel(c.signal)}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 capitalize text-[var(--adpilot-text-muted)]">
                      {c.objective ?? "—"}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.dailyBudget != null ? `${formatCurrency(c.dailyBudget)}/day` : "—"}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(c.spend)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(c.revenue)}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.roas.toFixed(2)}x</td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.cpa != null ? formatCurrency(c.cpa) : "—"}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.cpc != null ? formatCurrency(c.cpc) : "—"}
                    </td>
                    <td className="py-2 pr-3 tabular-nums">
                      {c.ctr != null ? formatPercent(c.ctr, 1) : "—"}
                    </td>
                    <td className="py-2 pr-3 tabular-nums text-xs">{healthEmoji(c.aiHealthScore)}</td>
                    <td className="max-w-[220px] py-2 pr-3 text-xs leading-relaxed text-[var(--adpilot-text-muted)]">
                      {c.manualActionNote}
                    </td>
                    <td className="py-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => setSelectedId(c.id)}
                        >
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="!px-2 !py-1 text-xs text-[var(--adpilot-accent)]"
                          onClick={() => runInlineAction("cd-drop", `Analyze ${c.name}`)}
                        >
                          Ask AI
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--adpilot-text-muted)]">
              No campaigns match the current filters.
            </p>
          ) : null}
        </Card>
      </div>
      {selectedId ? <CampaignDetailPanel campaignId={selectedId} onClose={() => setSelectedId(null)} /> : null}
    </>
  );
}
