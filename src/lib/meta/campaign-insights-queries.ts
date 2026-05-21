import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReportingInsightMetrics } from "@/lib/meta/sync/types";

export type MetaCampaignInsightDbRow = {
  campaign_id: string;
  campaign_name: string | null;
  metrics: ReportingInsightMetrics;
  date_start: string;
  date_end: string;
  date_range_preset: string;
  conversion_metrics_available: boolean;
  created_at: string;
};

export async function getLatestMetaCampaignInsights(
  supabase: SupabaseClient,
  organizationId: string,
  connectedMetaAdAccountId: string,
  dateRangePreset: string,
): Promise<MetaCampaignInsightDbRow[]> {
  const { data: latestRun, error: runError } = await supabase
    .from("meta_sync_runs")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("connected_meta_ad_account_id", connectedMetaAdAccountId)
    .eq("sync_type", "campaign_insights")
    .eq("status", "success")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (runError) {
    console.error("[meta/campaign-insights] latest run:", runError.message);
  }

  let query = supabase
    .from("meta_campaign_insights")
    .select(
      "campaign_id, campaign_name, metrics, date_start, date_end, date_range_preset, conversion_metrics_available, created_at",
    )
    .eq("organization_id", organizationId)
    .eq("connected_meta_ad_account_id", connectedMetaAdAccountId)
    .eq("date_range_preset", dateRangePreset)
    .order("created_at", { ascending: false });

  if (latestRun?.id) {
    query = query.eq("sync_run_id", latestRun.id);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    console.error("[meta/campaign-insights] fetch:", error.message);
    return [];
  }

  const rows = (data ?? []) as MetaCampaignInsightDbRow[];
  const byCampaign = new Map<string, MetaCampaignInsightDbRow>();
  for (const row of rows) {
    if (!row.campaign_id) continue;
    if (!byCampaign.has(row.campaign_id)) {
      byCampaign.set(row.campaign_id, row);
    }
  }

  return [...byCampaign.values()];
}
