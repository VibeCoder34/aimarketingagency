"use client";

import { useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import type {
  NormalizedRecommendation,
  RecommendationData,
  RecommendationPriority,
  RecommendationStatus,
} from "@/lib/data/types";
import {
  DEFAULT_RECOMMENDATION_FILTERS,
  filterRecommendations,
  getRecommendationCategoryLabel,
  getRecommendationStatusLabel,
  RECOMMENDATION_CATEGORY_OPTIONS,
  RECOMMENDATION_PRIORITY_OPTIONS,
  RECOMMENDATION_SOURCE_OPTIONS,
  RECOMMENDATION_STATUS_OPTIONS,
  type RecommendationFilters,
} from "@/lib/data/recommendations-query";
import { RecommendationActions } from "@/components/recommendations/recommendation-actions";
import { PageActions } from "@/components/pages/page-actions";
import { FilterChips } from "@/components/ui/filter-chips";
import { Badge } from "@/components/ui/badge";

const PRIORITY_VARIANT: Record<RecommendationPriority, "danger" | "warning" | "default" | "muted"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "muted",
};

const IMPACT_VARIANT: Record<
  NormalizedRecommendation["impactEstimate"]["variant"],
  "danger" | "warning" | "default" | "muted" | "success"
> = {
  danger: "danger",
  success: "success",
  warning: "warning",
  default: "default",
};

function formatNum(n: number) {
  return n.toLocaleString("en-US");
}

function RecommendationCard({
  rec,
  status,
  onStatusChange,
}: {
  rec: NormalizedRecommendation;
  status: RecommendationStatus;
  onStatusChange: (status: RecommendationStatus) => void;
}) {
  return (
    <article className="rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={PRIORITY_VARIANT[rec.priority]}>{rec.priority.toUpperCase()}</Badge>
        <Badge variant="muted">{getRecommendationCategoryLabel(rec.category)}</Badge>
        <Badge variant="default">{getRecommendationStatusLabel(status)}</Badge>
        <span className="text-xs text-[var(--adpilot-text-muted)]">
          {rec.sourceEntityType}: {rec.sourceEntityName}
        </span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-[var(--adpilot-text-primary)]">{rec.title}</h3>
      <p className="mt-1 text-sm text-[var(--adpilot-text-muted)]">{rec.summary}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--adpilot-text-muted)]">{rec.explanation}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {rec.evidencePoints.map((point) => (
          <li
            key={`${point.label}-${point.value}`}
            className="rounded-md border border-[var(--adpilot-border)] px-2 py-1 text-xs tabular-nums"
          >
            <span className="text-[var(--adpilot-text-muted)]">{point.label}:</span> {point.value}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-medium text-[var(--adpilot-text-primary)]">
        Estimated impact:{" "}
        <Badge variant={IMPACT_VARIANT[rec.impactEstimate.variant]} className="ml-1 align-middle">
          {rec.impactEstimate.summary}
        </Badge>
      </p>
      <div className="mt-3 rounded-lg border border-[var(--adpilot-border)] bg-zinc-50/60 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--adpilot-text-muted)]">
          Manual action
        </p>
        <p className="mt-1 text-sm text-[var(--adpilot-text-primary)]">{rec.manualAction.summary}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-[var(--adpilot-text-muted)]">
          {rec.manualAction.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[var(--adpilot-text-muted)]">{rec.readOnlyNotice}</p>
      <RecommendationActions
        manualActionSummary={`${rec.manualAction.summary}\n\n${rec.manualAction.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`}
        status={status}
        onStatusChange={onStatusChange}
      />
    </article>
  );
}

export type RecommendationsPageProps = {
  data: RecommendationData;
};

export function RecommendationsPage({ data }: RecommendationsPageProps) {
  const [filters, setFilters] = useState<RecommendationFilters>(DEFAULT_RECOMMENDATION_FILTERS);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RecommendationStatus>>({});

  const recommendationsWithStatus = useMemo(
    () =>
      data.recommendations.map((rec) => ({
        ...rec,
        status: statusOverrides[rec.id] ?? rec.status,
      })),
    [data.recommendations, statusOverrides],
  );

  const visible = useMemo(
    () => filterRecommendations(recommendationsWithStatus, filters),
    [recommendationsWithStatus, filters],
  );

  const priorityLabel =
    RECOMMENDATION_PRIORITY_OPTIONS.find((o) => o.value === filters.priority)?.label ?? "All";
  const categoryLabel =
    RECOMMENDATION_CATEGORY_OPTIONS.find((o) => o.value === filters.category)?.label ?? "All";
  const statusLabel =
    RECOMMENDATION_STATUS_OPTIONS.find((o) => o.value === filters.status)?.label ?? "All";
  const sourceLabel =
    RECOMMENDATION_SOURCE_OPTIONS.find((o) => o.value === filters.sourceEntityType)?.label ?? "All sources";

  const setPriority = (label: string) => {
    const match = RECOMMENDATION_PRIORITY_OPTIONS.find((o) => o.label === label);
    if (match) setFilters((f) => ({ ...f, priority: match.value }));
  };

  const setCategory = (label: string) => {
    const match = RECOMMENDATION_CATEGORY_OPTIONS.find((o) => o.label === label);
    if (match) setFilters((f) => ({ ...f, category: match.value }));
  };

  const setStatusFilter = (label: string) => {
    const match = RECOMMENDATION_STATUS_OPTIONS.find((o) => o.label === label);
    if (match) setFilters((f) => ({ ...f, status: match.value }));
  };

  const setSource = (label: string) => {
    const match = RECOMMENDATION_SOURCE_OPTIONS.find((o) => o.label === label);
    if (match) setFilters((f) => ({ ...f, sourceEntityType: match.value }));
  };

  const handleStatusChange = (recId: string, status: RecommendationStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [recId]: status }));
  };

  const { summary } = data;

  return (
    <>
      <PageActions showExport={false} />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--adpilot-text-muted)]">
              {data.context.accountName}
            </p>
            <p className="text-sm text-[var(--adpilot-text-muted)]">
              {data.context.dateRangeLabel} · Last analyzed {summary.lastAnalyzedLabel}
            </p>
          </div>
          <Badge variant="muted">Read-only · mock data</Badge>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[var(--adpilot-accent)]" aria-hidden />
            <h2 className="text-lg font-semibold text-[var(--adpilot-text-primary)]">Recommendations</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--adpilot-text-muted)]">
            Agency action center — what needs attention, why, and what to do manually in Meta Ads Manager.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Active recommendations", value: String(summary.activeCount) },
            { label: "Urgent issues", value: String(summary.urgentCount) },
            {
              label: "Estimated monthly savings",
              value: `$${formatNum(summary.estimatedMonthlySavingsUsd)}`,
            },
            {
              label: "Estimated revenue uplift",
              value: `+$${formatNum(summary.estimatedRevenueUpliftUsd)}`,
            },
            { label: "Last analyzed", value: summary.lastAnalyzedLabel },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4"
            >
              <p className="text-xs uppercase text-[var(--adpilot-text-muted)]">{s.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <FilterChips
            label="Priority"
            options={RECOMMENDATION_PRIORITY_OPTIONS.map((o) => o.label)}
            value={priorityLabel}
            onChange={setPriority}
          />
          <FilterChips
            label="Category"
            options={RECOMMENDATION_CATEGORY_OPTIONS.map((o) => o.label)}
            value={categoryLabel}
            onChange={setCategory}
          />
          <FilterChips
            label="Status"
            options={RECOMMENDATION_STATUS_OPTIONS.map((o) => o.label)}
            value={statusLabel}
            onChange={setStatusFilter}
          />
          <FilterChips
            label="Source"
            options={RECOMMENDATION_SOURCE_OPTIONS.map((o) => o.label)}
            value={sourceLabel}
            onChange={setSource}
          />
          <input
            type="search"
            placeholder="Search recommendations..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-3 py-1.5 text-sm"
          />
        </div>

        <div className="space-y-4">
          {visible.length === 0 ? (
            <p className="text-sm text-[var(--adpilot-text-muted)]">No recommendations match your filters.</p>
          ) : (
            visible.map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                status={rec.status}
                onStatusChange={(status) => handleStatusChange(rec.id, status)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
