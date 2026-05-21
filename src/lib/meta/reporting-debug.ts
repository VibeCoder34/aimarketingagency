import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashboardUserContext } from "@/lib/supabase/user-context";
import { getAdAccountsPageData, type ConnectedMetaAdAccountRow } from "@/lib/meta/queries";
import type { ReportingInsightMetrics } from "@/lib/meta/sync/types";
import type { MetaOverviewMetrics } from "@/lib/meta/overview-metrics";

export type ReportingDebugSyncRunRow = {
  id: string;
  syncType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type ReportingDebugTableStats = {
  table: string;
  label: string;
  rowCount: number;
  dateStart: string | null;
  dateEnd: string | null;
  latestSyncedAt: string | null;
};

export type ReportingDebugCoverage = {
  trafficMetrics: boolean;
  purchases: boolean;
  leads: boolean;
  conversionValue: boolean;
  roas: boolean;
  platformBreakdown: boolean;
  creativeMetadata: boolean;
  notes: string[];
};

export type ReportingDebugPageData = {
  canAccess: boolean;
  accessDeniedReason?: string;
  metaConfigured: boolean;
  organizationId: string | null;
  organizationName: string;
  selectedAccount: ConnectedMetaAdAccountRow | null;
  accounts: ConnectedMetaAdAccountRow[];
  syncRuns: ReportingDebugSyncRunRow[];
  tables: ReportingDebugTableStats[];
  coverage: ReportingDebugCoverage;
};

type TableQueryConfig = {
  table: string;
  label: string;
  startColumn: string;
  endColumn?: string;
};

const REPORTING_TABLES: TableQueryConfig[] = [
  { table: "meta_raw_insight_snapshots", label: "Raw insight snapshots", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_overview_snapshots", label: "Overview snapshots", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_account_daily_insights", label: "Account daily", startColumn: "insight_date" },
  { table: "meta_campaign_insights", label: "Campaign (period)", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_adset_insights", label: "Ad set (period)", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_ad_insights", label: "Ad (period)", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_campaign_daily_insights", label: "Campaign daily", startColumn: "insight_date" },
  { table: "meta_adset_daily_insights", label: "Ad set daily", startColumn: "insight_date" },
  { table: "meta_ad_daily_insights", label: "Ad daily", startColumn: "insight_date" },
  { table: "meta_platform_breakdowns", label: "Platform breakdowns", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_demographic_breakdowns", label: "Demographic breakdowns", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_geo_breakdowns", label: "Geo breakdowns", startColumn: "date_start", endColumn: "date_end" },
  { table: "meta_creatives", label: "Creatives", startColumn: "created_at" },
];

function parseMetrics(value: unknown): Partial<ReportingInsightMetrics & MetaOverviewMetrics> | null {
  if (!value || typeof value !== "object") return null;
  return value as Partial<ReportingInsightMetrics & MetaOverviewMetrics>;
}

function assessCoverageFromMetrics(
  metrics: Partial<ReportingInsightMetrics & MetaOverviewMetrics> | null,
): Pick<ReportingDebugCoverage, "trafficMetrics" | "purchases" | "leads" | "conversionValue" | "roas"> {
  if (!metrics) {
    return {
      trafficMetrics: false,
      purchases: false,
      leads: false,
      conversionValue: false,
      roas: false,
    };
  }
  const spend = metrics.spend ?? 0;
  const impressions = metrics.impressions ?? 0;
  return {
    trafficMetrics: spend > 0 || impressions > 0,
    purchases: (metrics.purchases ?? 0) > 0,
    leads: (metrics.leads ?? 0) > 0,
    conversionValue: (metrics.conversionValue ?? 0) > 0,
    roas: (metrics.roas ?? 0) > 0,
  };
}

async function queryTableStats(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  config: TableQueryConfig,
  organizationId: string,
  connectedAccountId: string,
): Promise<ReportingDebugTableStats> {
  const base = () =>
    supabase
      .from(config.table)
      .select("*", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("connected_meta_ad_account_id", connectedAccountId);

  const { count, error: countError } = await base();
  if (countError) {
    console.error(`[reporting-debug] count ${config.table}:`, countError.message);
  }

  const rowCount = count ?? 0;
  let dateStart: string | null = null;
  let dateEnd: string | null = null;
  let latestSyncedAt: string | null = null;

  if (rowCount > 0) {
    const startCol = config.startColumn;
    const endCol = config.endColumn ?? config.startColumn;

    const { data: minRow } = await supabase
      .from(config.table)
      .select(startCol)
      .eq("organization_id", organizationId)
      .eq("connected_meta_ad_account_id", connectedAccountId)
      .order(startCol, { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: maxRow } = await supabase
      .from(config.table)
      .select(endCol)
      .eq("organization_id", organizationId)
      .eq("connected_meta_ad_account_id", connectedAccountId)
      .order(endCol, { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestOrderCol =
      config.table === "meta_overview_snapshots" ? "synced_at" : "created_at";
    const { data: latestRow } = await supabase
      .from(config.table)
      .select(`${latestOrderCol}`)
      .eq("organization_id", organizationId)
      .eq("connected_meta_ad_account_id", connectedAccountId)
      .order(latestOrderCol, { ascending: false })
      .limit(1)
      .maybeSingle();

    if (minRow) {
      const v = (minRow as unknown as Record<string, unknown>)[startCol];
      dateStart = v != null ? String(v).slice(0, 10) : null;
    }
    if (maxRow) {
      const v = (maxRow as unknown as Record<string, unknown>)[endCol];
      dateEnd = v != null ? String(v).slice(0, 10) : null;
    }
    if (latestRow) {
      const lr = latestRow as unknown as Record<string, string | undefined>;
      latestSyncedAt = lr.synced_at ?? lr.created_at ?? null;
    }
  }

  return {
    table: config.table,
    label: config.label,
    rowCount,
    dateStart,
    dateEnd,
    latestSyncedAt,
  };
}

export async function getReportingDebugPageData(
  metaConfigured: boolean,
): Promise<ReportingDebugPageData> {
  const base = await getAdAccountsPageData(metaConfigured);
  const ctx = await getDashboardUserContext();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !base.organizationId) {
    return {
      canAccess: false,
      accessDeniedReason: "Sign in to an organization workspace to use this tool.",
      metaConfigured,
      organizationId: base.organizationId,
      organizationName: base.organizationName,
      selectedAccount: null,
      accounts: [],
      syncRuns: [],
      tables: [],
      coverage: {
        trafficMetrics: false,
        purchases: false,
        leads: false,
        conversionValue: false,
        roas: false,
        platformBreakdown: false,
        creativeMetadata: false,
        notes: [],
      },
    };
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", base.organizationId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const canAccess = ["owner", "admin"].includes(membership?.role ?? "");
  if (!canAccess) {
    return {
      canAccess: false,
      accessDeniedReason: "Only organization owners and admins can access Meta reporting debug.",
      metaConfigured,
      organizationId: base.organizationId,
      organizationName: base.organizationName,
      selectedAccount: null,
      accounts: base.accounts,
      syncRuns: [],
      tables: [],
      coverage: {
        trafficMetrics: false,
        purchases: false,
        leads: false,
        conversionValue: false,
        roas: false,
        platformBreakdown: false,
        creativeMetadata: false,
        notes: [],
      },
    };
  }

  const selectedAccount =
    base.accounts.find((a) => a.is_selected) ?? base.accounts[0] ?? null;

  if (!selectedAccount) {
    return {
      canAccess: true,
      metaConfigured,
      organizationId: base.organizationId,
      organizationName: base.organizationName,
      selectedAccount: null,
      accounts: base.accounts,
      syncRuns: [],
      tables: REPORTING_TABLES.map((t) => ({
        table: t.table,
        label: t.label,
        rowCount: 0,
        dateStart: null,
        dateEnd: null,
        latestSyncedAt: null,
      })),
      coverage: {
        trafficMetrics: false,
        purchases: false,
        leads: false,
        conversionValue: false,
        roas: false,
        platformBreakdown: false,
        creativeMetadata: false,
        notes: ["No connected ad account — connect Meta and select an account first."],
      },
    };
  }

  const orgId = base.organizationId;
  const accountId = selectedAccount.id;

  const { data: runs, error: runsError } = await supabase
    .from("meta_sync_runs")
    .select("id, sync_type, status, started_at, completed_at, error_code, error_message")
    .eq("organization_id", orgId)
    .eq("connected_meta_ad_account_id", accountId)
    .order("started_at", { ascending: false })
    .limit(40);

  if (runsError) {
    console.error("[reporting-debug] sync runs:", runsError.message);
  }

  const syncRuns: ReportingDebugSyncRunRow[] = (runs ?? []).map((row) => {
    const startedAt = row.started_at as string;
    const finishedAt = (row.completed_at as string | null) ?? null;
    const durationMs =
      finishedAt != null
        ? new Date(finishedAt).getTime() - new Date(startedAt).getTime()
        : null;
    return {
      id: row.id as string,
      syncType: row.sync_type as string,
      status: row.status as string,
      startedAt,
      finishedAt,
      durationMs,
      errorCode: (row.error_code as string | null) ?? null,
      errorMessage: (row.error_message as string | null) ?? null,
    };
  });

  const tables = await Promise.all(
    REPORTING_TABLES.map((config) => queryTableStats(supabase, config, orgId, accountId)),
  );

  const platformTable = tables.find((t) => t.table === "meta_platform_breakdowns");
  const creativesTable = tables.find((t) => t.table === "meta_creatives");

  const { data: overviewSnap } = await supabase
    .from("meta_overview_snapshots")
    .select("metrics")
    .eq("organization_id", orgId)
    .eq("connected_meta_ad_account_id", accountId)
    .order("synced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: campaignSample } = await supabase
    .from("meta_campaign_insights")
    .select("metrics, conversion_metrics_available")
    .eq("organization_id", orgId)
    .eq("connected_meta_ad_account_id", accountId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const overviewMetrics = parseMetrics(overviewSnap?.metrics);
  const campaignMetrics = parseMetrics(campaignSample?.metrics);

  const fromOverview = assessCoverageFromMetrics(overviewMetrics);
  const fromCampaign = assessCoverageFromMetrics(campaignMetrics);

  const notes: string[] = [];
  if (overviewSnap && overviewMetrics && !overviewMetrics.hasConversionData) {
    notes.push("Latest overview snapshot has no conversion fields (traffic-only or empty conversions).");
  }
  if (campaignSample && campaignSample.conversion_metrics_available === false) {
    notes.push("Latest campaign insight row marked conversion_metrics_available=false.");
  }
  if ((platformTable?.rowCount ?? 0) > 0) {
    const { data: bd } = await supabase
      .from("meta_platform_breakdowns")
      .select("conversion_metrics_available")
      .eq("organization_id", orgId)
      .eq("connected_meta_ad_account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (bd?.conversion_metrics_available === false) {
      notes.push("Platform breakdown rows exist but latest row has traffic-only metrics.");
    }
  }

  const coverage: ReportingDebugCoverage = {
    trafficMetrics: fromOverview.trafficMetrics || fromCampaign.trafficMetrics,
    purchases: fromOverview.purchases || fromCampaign.purchases,
    leads: fromOverview.leads || fromCampaign.leads,
    conversionValue: fromOverview.conversionValue || fromCampaign.conversionValue,
    roas: fromOverview.roas || fromCampaign.roas,
    platformBreakdown: (platformTable?.rowCount ?? 0) > 0,
    creativeMetadata: (creativesTable?.rowCount ?? 0) > 0,
    notes,
  };

  if (tables.every((t) => t.rowCount === 0)) {
    coverage.notes.push("No reporting rows stored yet — run reporting sync below.");
  }

  return {
    canAccess: true,
    metaConfigured,
    organizationId: orgId,
    organizationName: base.organizationName,
    selectedAccount,
    accounts: base.accounts,
    syncRuns,
    tables,
    coverage,
  };
}
