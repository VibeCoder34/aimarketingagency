import type { SupabaseClient } from "@supabase/supabase-js";
import {
  coerceStoredMetaOverviewMetrics,
  type MetaOverviewMetrics,
} from "@/lib/meta/overview-metrics";
import { META_OVERVIEW_DATE_PRESET } from "@/lib/meta/overview-metrics";

export type MetaOverviewSnapshotRow = {
  id: string;
  organization_id: string;
  connected_meta_ad_account_id: string;
  date_range_preset: string;
  date_start: string;
  date_end: string;
  metrics: MetaOverviewMetrics;
  synced_at: string;
};

const SNAPSHOT_COLUMNS =
  "id, organization_id, connected_meta_ad_account_id, date_range_preset, date_start, date_end, metrics, synced_at";

export async function getLatestMetaOverviewSnapshot(
  supabase: SupabaseClient,
  organizationId: string,
  connectedMetaAdAccountId: string,
  dateRangePreset: string = META_OVERVIEW_DATE_PRESET,
): Promise<MetaOverviewSnapshotRow | null> {
  const { data, error } = await supabase
    .from("meta_overview_snapshots")
    .select(SNAPSHOT_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("connected_meta_ad_account_id", connectedMetaAdAccountId)
    .eq("date_range_preset", dateRangePreset)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[meta/overview-snapshots] latest:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    ...(data as MetaOverviewSnapshotRow),
    metrics: coerceStoredMetaOverviewMetrics(
      (data as MetaOverviewSnapshotRow).metrics,
    ),
  };
}

export async function insertMetaOverviewSnapshot(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    connectedMetaAdAccountId: string;
    dateRangePreset: string;
    dateStart: string;
    dateEnd: string;
    metrics: MetaOverviewMetrics;
    rawResponse: unknown;
  },
): Promise<MetaOverviewSnapshotRow | null> {
  const { data, error } = await supabase
    .from("meta_overview_snapshots")
    .insert({
      organization_id: input.organizationId,
      connected_meta_ad_account_id: input.connectedMetaAdAccountId,
      date_range_preset: input.dateRangePreset,
      date_start: input.dateStart,
      date_end: input.dateEnd,
      metrics: input.metrics,
      raw_response: input.rawResponse,
      synced_at: new Date().toISOString(),
    })
    .select(SNAPSHOT_COLUMNS)
    .single();

  if (error) {
    console.error("[meta/overview-snapshots] insert:", error.message);
    return null;
  }

  return {
    ...(data as MetaOverviewSnapshotRow),
    metrics: coerceStoredMetaOverviewMetrics(
      (data as MetaOverviewSnapshotRow).metrics,
    ),
  };
}
