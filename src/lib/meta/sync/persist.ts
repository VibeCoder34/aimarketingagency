import type { SupabaseClient } from "@supabase/supabase-js";
import { parseCreativeFromAdRow } from "@/lib/meta/sync/parse-creative";
import type { MetaBreakdownKind, MetaReportingSyncType, MetaSyncAccountContext } from "@/lib/meta/sync/types";
import type { MetaInsightEntityLevel, MetaReportingInsightRow, ReportingInsightMetrics } from "@/lib/meta/sync/types";

const BATCH_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export async function insertRawInsightSnapshot(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    syncType: MetaReportingSyncType;
    entityLevel?: MetaInsightEntityLevel | null;
    breakdownKind?: MetaBreakdownKind | null;
    dateStart: string;
    dateEnd: string;
    rows: unknown[];
    truncated: boolean;
  },
): Promise<void> {
  const { error } = await supabase.from("meta_raw_insight_snapshots").insert({
    organization_id: ctx.organizationId,
    connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
    meta_ad_account_id: ctx.metaAdAccountId,
    sync_run_id: input.syncRunId,
    sync_type: input.syncType,
    entity_level: input.entityLevel ?? null,
    breakdown_kind: input.breakdownKind ?? null,
    date_range_preset: ctx.datePreset,
    date_start: input.dateStart,
    date_end: input.dateEnd,
    row_count: input.rows.length,
    truncated: input.truncated,
    raw_response: input.rows,
  });

  if (error) {
    throw new Error(`meta_raw_insight_snapshots: ${error.message}`);
  }
}

type EntityPersistInput = {
  syncRunId: string;
  dateStart: string;
  dateEnd: string;
  rows: { row: MetaReportingInsightRow; metrics: ReportingInsightMetrics }[];
};

export async function insertCampaignInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: EntityPersistInput,
): Promise<number> {
  const payload = input.rows
    .filter((r) => r.row.campaign_id)
    .map((r) => ({
      organization_id: ctx.organizationId,
      connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
      meta_ad_account_id: ctx.metaAdAccountId,
      sync_run_id: input.syncRunId,
      date_range_preset: ctx.datePreset,
      date_start: input.dateStart,
      date_end: input.dateEnd,
      campaign_id: r.row.campaign_id!,
      campaign_name: r.row.campaign_name ?? null,
      metrics: r.metrics,
      raw_row: r.row,
      conversion_metrics_available: r.metrics.conversionMetricsAvailable,
    }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_campaign_insights").insert(batch);
    if (error) throw new Error(`meta_campaign_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertAdsetInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: EntityPersistInput,
): Promise<number> {
  const payload = input.rows
    .filter((r) => r.row.adset_id)
    .map((r) => ({
      organization_id: ctx.organizationId,
      connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
      meta_ad_account_id: ctx.metaAdAccountId,
      sync_run_id: input.syncRunId,
      date_range_preset: ctx.datePreset,
      date_start: input.dateStart,
      date_end: input.dateEnd,
      campaign_id: r.row.campaign_id ?? null,
      campaign_name: r.row.campaign_name ?? null,
      adset_id: r.row.adset_id!,
      adset_name: r.row.adset_name ?? null,
      metrics: r.metrics,
      raw_row: r.row,
      conversion_metrics_available: r.metrics.conversionMetricsAvailable,
    }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_adset_insights").insert(batch);
    if (error) throw new Error(`meta_adset_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertAdInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: EntityPersistInput,
): Promise<number> {
  const payload = input.rows
    .filter((r) => r.row.ad_id)
    .map((r) => ({
      organization_id: ctx.organizationId,
      connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
      meta_ad_account_id: ctx.metaAdAccountId,
      sync_run_id: input.syncRunId,
      date_range_preset: ctx.datePreset,
      date_start: input.dateStart,
      date_end: input.dateEnd,
      campaign_id: r.row.campaign_id ?? null,
      campaign_name: r.row.campaign_name ?? null,
      adset_id: r.row.adset_id ?? null,
      adset_name: r.row.adset_name ?? null,
      ad_id: r.row.ad_id!,
      ad_name: r.row.ad_name ?? null,
      metrics: r.metrics,
      raw_row: r.row,
      conversion_metrics_available: r.metrics.conversionMetricsAvailable,
    }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_ad_insights").insert(batch);
    if (error) throw new Error(`meta_ad_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertAccountDailyInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    rows: { insightDate: string; row: MetaReportingInsightRow; metrics: ReportingInsightMetrics }[];
  },
): Promise<number> {
  const payload = input.rows.map((r) => ({
    organization_id: ctx.organizationId,
    connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
    meta_ad_account_id: ctx.metaAdAccountId,
    sync_run_id: input.syncRunId,
    date_range_preset: ctx.datePreset,
    insight_date: r.insightDate,
    metrics: r.metrics,
    raw_row: r.row,
    conversion_metrics_available: r.metrics.conversionMetricsAvailable,
  }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_account_daily_insights").insert(batch);
    if (error) throw new Error(`meta_account_daily_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertCampaignDailyInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    rows: {
      insightDate: string;
      row: MetaReportingInsightRow;
      metrics: ReportingInsightMetrics;
    }[];
  },
): Promise<number> {
  const payload = input.rows
    .filter((r) => r.row.campaign_id)
    .map((r) => ({
      organization_id: ctx.organizationId,
      connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
      meta_ad_account_id: ctx.metaAdAccountId,
      sync_run_id: input.syncRunId,
      date_range_preset: ctx.datePreset,
      campaign_id: r.row.campaign_id!,
      campaign_name: r.row.campaign_name ?? null,
      insight_date: r.insightDate,
      metrics: r.metrics,
      raw_row: r.row,
      conversion_metrics_available: r.metrics.conversionMetricsAvailable,
    }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_campaign_daily_insights").insert(batch);
    if (error) throw new Error(`meta_campaign_daily_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertAdsetDailyInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    rows: {
      insightDate: string;
      row: MetaReportingInsightRow;
      metrics: ReportingInsightMetrics;
    }[];
  },
): Promise<number> {
  const payload = input.rows
    .filter((r) => r.row.adset_id)
    .map((r) => ({
      organization_id: ctx.organizationId,
      connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
      meta_ad_account_id: ctx.metaAdAccountId,
      sync_run_id: input.syncRunId,
      date_range_preset: ctx.datePreset,
      campaign_id: r.row.campaign_id ?? null,
      adset_id: r.row.adset_id!,
      adset_name: r.row.adset_name ?? null,
      insight_date: r.insightDate,
      metrics: r.metrics,
      raw_row: r.row,
      conversion_metrics_available: r.metrics.conversionMetricsAvailable,
    }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_adset_daily_insights").insert(batch);
    if (error) throw new Error(`meta_adset_daily_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertAdDailyInsights(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    rows: {
      insightDate: string;
      row: MetaReportingInsightRow;
      metrics: ReportingInsightMetrics;
    }[];
  },
): Promise<number> {
  const payload = input.rows
    .filter((r) => r.row.ad_id)
    .map((r) => ({
      organization_id: ctx.organizationId,
      connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
      meta_ad_account_id: ctx.metaAdAccountId,
      sync_run_id: input.syncRunId,
      date_range_preset: ctx.datePreset,
      campaign_id: r.row.campaign_id ?? null,
      adset_id: r.row.adset_id ?? null,
      ad_id: r.row.ad_id!,
      ad_name: r.row.ad_name ?? null,
      insight_date: r.insightDate,
      metrics: r.metrics,
      raw_row: r.row,
      conversion_metrics_available: r.metrics.conversionMetricsAvailable,
    }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_ad_daily_insights").insert(batch);
    if (error) throw new Error(`meta_ad_daily_insights: ${error.message}`);
  }
  return payload.length;
}

export async function insertPlatformBreakdowns(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    breakdownKind: MetaBreakdownKind;
    dateStart: string;
    dateEnd: string;
    rows: { row: MetaReportingInsightRow; metrics: ReportingInsightMetrics }[];
  },
): Promise<number> {
  const payload = input.rows.map((r) => ({
    organization_id: ctx.organizationId,
    connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
    meta_ad_account_id: ctx.metaAdAccountId,
    sync_run_id: input.syncRunId,
    breakdown_kind: input.breakdownKind,
    date_range_preset: ctx.datePreset,
    date_start: input.dateStart,
    date_end: input.dateEnd,
    publisher_platform: r.row.publisher_platform ?? null,
    platform_position: r.row.platform_position ?? null,
    device_platform: r.row.device_platform ?? r.row.impression_device ?? null,
    metrics: r.metrics,
    raw_row: r.row,
    conversion_metrics_available: r.metrics.conversionMetricsAvailable,
  }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_platform_breakdowns").insert(batch);
    if (error) throw new Error(`meta_platform_breakdowns: ${error.message}`);
  }
  return payload.length;
}

export async function insertDemographicBreakdowns(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    dateStart: string;
    dateEnd: string;
    rows: { row: MetaReportingInsightRow; metrics: ReportingInsightMetrics }[];
  },
): Promise<number> {
  const payload = input.rows.map((r) => ({
    organization_id: ctx.organizationId,
    connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
    meta_ad_account_id: ctx.metaAdAccountId,
    sync_run_id: input.syncRunId,
    date_range_preset: ctx.datePreset,
    date_start: input.dateStart,
    date_end: input.dateEnd,
    age: r.row.age ?? null,
    gender: r.row.gender ?? null,
    metrics: r.metrics,
    raw_row: r.row,
    conversion_metrics_available: r.metrics.conversionMetricsAvailable,
  }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_demographic_breakdowns").insert(batch);
    if (error) throw new Error(`meta_demographic_breakdowns: ${error.message}`);
  }
  return payload.length;
}

export async function insertGeoBreakdowns(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    breakdownKind: MetaBreakdownKind;
    dateStart: string;
    dateEnd: string;
    rows: { row: MetaReportingInsightRow; metrics: ReportingInsightMetrics }[];
  },
): Promise<number> {
  const payload = input.rows.map((r) => ({
    organization_id: ctx.organizationId,
    connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
    meta_ad_account_id: ctx.metaAdAccountId,
    sync_run_id: input.syncRunId,
    breakdown_kind: input.breakdownKind,
    date_range_preset: ctx.datePreset,
    date_start: input.dateStart,
    date_end: input.dateEnd,
    country: r.row.country ?? null,
    region: r.row.region ?? null,
    metrics: r.metrics,
    raw_row: r.row,
    conversion_metrics_available: r.metrics.conversionMetricsAvailable,
  }));

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_geo_breakdowns").insert(batch);
    if (error) throw new Error(`meta_geo_breakdowns: ${error.message}`);
  }
  return payload.length;
}

export async function insertMetaCreatives(
  supabase: SupabaseClient,
  ctx: MetaSyncAccountContext,
  input: {
    syncRunId: string;
    rows: Record<string, unknown>[];
  },
): Promise<number> {
  const payload = input.rows
    .map((row) => {
      try {
        const parsed = parseCreativeFromAdRow(row);
        if (!parsed) return null;
        return {
          organization_id: ctx.organizationId,
          connected_meta_ad_account_id: ctx.connectedMetaAdAccountId,
          meta_ad_account_id: ctx.metaAdAccountId,
          sync_run_id: input.syncRunId,
          ad_id: parsed.adId,
          ad_name: parsed.adName,
          creative_id: parsed.creativeId,
          thumbnail_url: parsed.thumbnailUrl,
          body_text: parsed.bodyText,
          title: parsed.title,
          description: parsed.description,
          call_to_action_type: parsed.callToActionType,
          object_story_spec: parsed.objectStorySpec,
          asset_feed_spec: parsed.assetFeedSpec,
          image_hash: parsed.imageHash,
          video_id: parsed.videoId,
          raw_response: parsed.rawResponse,
        };
      } catch (err) {
        console.warn("[meta/creatives] skip row parse:", err);
        return null;
      }
    })
    .filter((row): row is NonNullable<typeof row> => row != null);

  if (payload.length === 0) {
    return 0;
  }

  for (const batch of chunk(payload, BATCH_SIZE)) {
    const { error } = await supabase.from("meta_creatives").insert(batch);
    if (error) throw new Error(`meta_creatives: ${error.message}`);
  }
  return payload.length;
}
