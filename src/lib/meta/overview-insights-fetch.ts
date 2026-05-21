import type { MetaEnvConfig } from "@/lib/meta/env";
import { fetchGraphPaginated } from "@/lib/meta/explorer-fetch";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import {
  estimateDateRangeForPreset,
  type MetaOverviewDatePresetId,
} from "@/lib/meta/overview-date-presets";
import {
  EMPTY_META_OVERVIEW_METRICS,
  normalizeMetaOverviewMetrics,
  type MetaOverviewInsightRow,
  type MetaOverviewMetrics,
} from "@/lib/meta/overview-metrics";
import { buildInsightsFieldList } from "@/lib/meta/sync/fields";

export type MetaOverviewInsightsFetchResult = {
  metrics: MetaOverviewMetrics;
  dateStart: string;
  dateEnd: string;
  rawRows: MetaOverviewInsightRow[];
  /** True when Meta returned no rows — we store zeros instead of failing sync. */
  emptyPeriod: boolean;
};

function graphBase(config: MetaEnvConfig) {
  return `https://graph.facebook.com/${config.graphVersion}`;
}

const EMPTY_METRICS = EMPTY_META_OVERVIEW_METRICS;

export async function fetchMetaAccountOverviewInsights(
  config: MetaEnvConfig,
  accessToken: string,
  actId: string,
  organizationId: string,
  datePreset: MetaOverviewDatePresetId,
): Promise<MetaOverviewInsightsFetchResult> {
  const fields = buildInsightsFieldList("account");
  const params = new URLSearchParams({
    fields,
    date_preset: datePreset,
    access_token: accessToken,
    limit: "1",
  });

  const url = `${graphBase(config)}/${actId}/insights?${params.toString()}`;
  const result = await fetchGraphPaginated<MetaOverviewInsightRow>(url, {
    operation: "account_insights",
    organizationId,
    adAccountId: actId,
  });

  const row = result.data[0] as MetaOverviewInsightRow | undefined;

  if (!row) {
    const estimated = estimateDateRangeForPreset(datePreset);
    return {
      metrics: EMPTY_METRICS,
      dateStart: estimated.start,
      dateEnd: estimated.end,
      rawRows: [],
      emptyPeriod: true,
    };
  }

  const dateStart = row.date_start ?? estimateDateRangeForPreset(datePreset).start;
  const dateEnd = row.date_stop ?? estimateDateRangeForPreset(datePreset).end;

  return {
    metrics: normalizeMetaOverviewMetrics(row),
    dateStart,
    dateEnd,
    rawRows: result.data as MetaOverviewInsightRow[],
    emptyPeriod: false,
  };
}
