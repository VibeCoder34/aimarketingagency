import type { MetaEnvConfig } from "@/lib/meta/env";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import {
  estimateDateRangeForPreset,
  type MetaOverviewDatePresetId,
} from "@/lib/meta/overview-date-presets";
import { buildInsightsFieldList } from "@/lib/meta/sync/fields";
import { inferDateBounds } from "@/lib/meta/sync/normalize-insight";
import type {
  MetaInsightEntityLevel,
  MetaInsightsFetchOptions,
  MetaInsightsFetchResult,
  MetaReportingInsightRow,
} from "@/lib/meta/sync/types";

export const META_SYNC_MAX_PAGES = 50;

function graphBase(config: MetaEnvConfig) {
  return `https://graph.facebook.com/${config.graphVersion}`;
}

type MetaPagingBody = {
  data?: MetaReportingInsightRow[];
  paging?: { next?: string };
  error?: { message?: string; code?: number; type?: string };
};

function mapGraphError(error: { message?: string; code?: number }): MetaExplorerError {
  const code = error.code;
  const message = error.message ?? "Meta API request failed.";
  if (code === 4 || code === 17 || code === 32 || code === 613) {
    return new MetaExplorerError("RATE_LIMITED", "Meta rate limit reached. Try again later.", code);
  }
  if (code === 190 || code === 102 || code === 463) {
    return new MetaExplorerError("TOKEN_EXPIRED", "Meta token is invalid or expired. Reconnect Meta Ads.", code);
  }
  if (code === 10 || code === 200 || code === 294) {
    return new MetaExplorerError("FORBIDDEN", "Permission denied for this Meta request.", code);
  }
  return new MetaExplorerError("META_API_ERROR", message, code);
}

async function fetchPaginatedInsights(url: string): Promise<{
  rows: MetaReportingInsightRow[];
  truncated: boolean;
  pagesFetched: number;
}> {
  const combined: MetaReportingInsightRow[] = [];
  let nextUrl: string | null = url;
  let pagesFetched = 0;
  let truncated = false;

  while (nextUrl && pagesFetched < META_SYNC_MAX_PAGES) {
    const res = await fetch(nextUrl, { method: "GET", cache: "no-store" });
    const body = (await res.json()) as MetaPagingBody;

    if (!res.ok || body.error) {
      throw mapGraphError(body.error ?? { message: `HTTP ${res.status}` });
    }

    combined.push(...(body.data ?? []));
    pagesFetched += 1;
    nextUrl = body.paging?.next ?? null;
  }

  if (nextUrl) truncated = true;
  return { rows: combined, truncated, pagesFetched };
}

function buildInsightsUrl(
  config: MetaEnvConfig,
  accessToken: string,
  actId: string,
  datePreset: MetaOverviewDatePresetId,
  level: MetaInsightEntityLevel,
  options: MetaInsightsFetchOptions,
): string {
  const params = new URLSearchParams({
    fields: buildInsightsFieldList(level, { trafficOnly: options.trafficOnly }),
    date_preset: datePreset,
    access_token: accessToken,
    limit: String(options.limit ?? 500),
  });

  if (level !== "account") {
    params.set("level", level);
  }

  if (options.timeIncrement != null) {
    params.set("time_increment", String(options.timeIncrement));
  }

  if (options.breakdowns) {
    params.set("breakdowns", options.breakdowns);
  }

  return `${graphBase(config)}/${actId}/insights?${params.toString()}`;
}

export async function fetchMetaInsights(
  config: MetaEnvConfig,
  accessToken: string,
  actId: string,
  datePreset: MetaOverviewDatePresetId,
  level: MetaInsightEntityLevel,
  options: MetaInsightsFetchOptions = {},
): Promise<MetaInsightsFetchResult> {
  const fallback = estimateDateRangeForPreset(datePreset);

  const attempt = async (trafficOnly: boolean) => {
    const url = buildInsightsUrl(config, accessToken, actId, datePreset, level, {
      ...options,
      trafficOnly,
    });
    return fetchPaginatedInsights(url);
  };

  let usedTrafficOnlyFields = Boolean(options.trafficOnly);
  let rows: MetaReportingInsightRow[];
  let truncated: boolean;
  let pagesFetched: number;

  try {
    const result = await attempt(usedTrafficOnlyFields);
    rows = result.rows;
    truncated = result.truncated;
    pagesFetched = result.pagesFetched;
  } catch (err) {
    if (!options.trafficOnly && err instanceof MetaExplorerError) {
      const retry = await attempt(true);
      rows = retry.rows;
      truncated = retry.truncated;
      pagesFetched = retry.pagesFetched;
      usedTrafficOnlyFields = true;
    } else {
      throw err;
    }
  }

  const bounds = inferDateBounds(rows, fallback);
  return {
    rows,
    truncated,
    pagesFetched,
    dateStart: bounds.start,
    dateEnd: bounds.end,
    usedTrafficOnlyFields,
  };
}
