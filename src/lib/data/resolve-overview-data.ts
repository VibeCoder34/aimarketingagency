import { getMockOverviewData } from "@/lib/data/adapters/mock-adapter";
import {
  buildMetaOverviewShell,
  mapMetaSnapshotToOverviewData,
} from "@/lib/data/adapters/meta-overview-mapper";
import { defaultOverviewParams } from "@/lib/data/get-dashboard-data";
import type { OverviewData } from "@/lib/data/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getMetaIntegrationStatus,
  isMetaConnectionUsable,
} from "@/lib/meta/integration-ui";
import type { AdAccountsPageData, ConnectedMetaAdAccountRow } from "@/lib/meta/queries";
import { getLatestMetaCampaignInsights } from "@/lib/meta/campaign-insights-queries";
import { buildOverviewCampaignSignals } from "@/lib/meta/campaign-insights-overview";
import { getLatestMetaOverviewSnapshot } from "@/lib/meta/overview-snapshots";
import { setSelectedMetaAdAccount } from "@/lib/meta/select-ad-account";
import {
  labelForOverviewDatePreset,
  META_OVERVIEW_DEFAULT_DATE_PRESET,
  resolveOverviewDatePreset,
  type MetaOverviewDatePresetId,
} from "@/lib/meta/overview-date-presets";

const DEFAULT_RANGE_LABEL = labelForOverviewDatePreset(META_OVERVIEW_DEFAULT_DATE_PRESET);

function buildDemoOverviewData(): OverviewData {
  const data = getMockOverviewData(defaultOverviewParams());
  return {
    ...data,
    displayMode: "demo",
    context: {
      ...data.context,
      dataSourceLabel: "demo",
      dataSourceBadge: "Demo data",
      demoCtaLabel: "Connect Meta to see live data",
      canRefreshData: false,
    },
  };
}

function findSelectedAccount(accounts: ConnectedMetaAdAccountRow[]): ConnectedMetaAdAccountRow | null {
  return accounts.find((row) => row.is_selected) ?? null;
}

export async function resolveOverviewForPage(
  metaConnection: AdAccountsPageData,
  datePresetInput?: string | null,
): Promise<OverviewData> {
  const datePreset: MetaOverviewDatePresetId = resolveOverviewDatePreset(datePresetInput);
  const integrationStatus = getMetaIntegrationStatus(metaConnection);

  if (!isMetaConnectionUsable(metaConnection)) {
    return buildDemoOverviewData();
  }

  if (integrationStatus === "reconnect_required" || integrationStatus === "connection_issue") {
    return {
      source: "meta",
      displayMode: "reconnect_required",
      account: {
        id: "meta",
        name: metaConnection.organizationName,
        currency: "USD",
        metaAdAccountId: null,
      },
      dateRange: {
        preset: META_OVERVIEW_DEFAULT_DATE_PRESET,
        start: "",
        end: "",
        label: DEFAULT_RANGE_LABEL,
        detailLabel: "",
      },
      context: {
        accountName: metaConnection.organizationName,
        dateRangeLabel: DEFAULT_RANGE_LABEL,
        dateRangeDetail: "",
        lastSyncedAgo: "—",
        dataSourceLabel: "live_meta",
        dataSourceBadge: "Reconnect Meta",
        bannerTitle: "Reconnect Meta",
        bannerMessage:
          "Your Meta connection needs to be refreshed before live data can load.",
        canRefreshData: false,
      },
      health: {
        status: "at_risk",
        statusLabel: "Reconnect required",
        explanation: "Meta token expired or connection issue — reconnect to resume live data.",
        chips: [{ label: "Reconnect required", variant: "danger" }],
      },
      kpis: [],
      dailyInsights: [],
      spendChartCaption: "",
      whatChanged: [],
      campaigns: [],
      recommendations: [],
      budgetPacing: null,
      platformBreakdown: [],
      platformInsight: "",
      dataCoverage: [],
      alerts: [],
      aiQuickActions: [],
    };
  }

  if (metaConnection.accounts.length === 0) {
    return {
      source: "meta",
      displayMode: "no_accounts",
      account: {
        id: "pending",
        name: metaConnection.organizationName,
        currency: "USD",
        metaAdAccountId: null,
      },
      dateRange: {
        preset: META_OVERVIEW_DEFAULT_DATE_PRESET,
        start: "",
        end: "",
        label: DEFAULT_RANGE_LABEL,
        detailLabel: "",
      },
      context: {
        accountName: metaConnection.organizationName,
        dateRangeLabel: DEFAULT_RANGE_LABEL,
        dateRangeDetail: "",
        lastSyncedAgo: "never",
        dataSourceLabel: "live_meta",
        dataSourceBadge: "Live Meta data",
        bannerTitle: "No ad accounts found",
        bannerMessage:
          "Meta is connected but no ad accounts were returned. Reconnect or check permissions in Meta Business Settings.",
        canRefreshData: false,
      },
      health: {
        status: "needs_attention",
        statusLabel: "No accounts",
        explanation: "Connect an ad account with ads_read access to continue.",
        chips: [{ label: "No ad accounts", variant: "warning" }],
      },
      kpis: [],
      dailyInsights: [],
      spendChartCaption: "",
      whatChanged: [],
      campaigns: [],
      recommendations: [],
      budgetPacing: null,
      platformBreakdown: [],
      platformInsight: "",
      dataCoverage: [],
      alerts: [],
      aiQuickActions: [],
    };
  }

  const supabase = await createSupabaseServerClient();
  let selected = findSelectedAccount(metaConnection.accounts);

  if (!selected && metaConnection.accounts.length === 1) {
    const sole = metaConnection.accounts[0]!;
    await setSelectedMetaAdAccount(supabase, sole.id);
    selected = { ...sole, is_selected: true };
  }

  if (!selected) {
    const placeholder = metaConnection.accounts[0]!;
    return {
      source: "meta",
      displayMode: "select_account",
      account: {
        id: placeholder.id,
        name: "Select an ad account",
        currency: placeholder.currency ?? "USD",
        metaAdAccountId: null,
      },
      dateRange: {
        preset: META_OVERVIEW_DEFAULT_DATE_PRESET,
        start: "",
        end: "",
        label: DEFAULT_RANGE_LABEL,
        detailLabel: "",
      },
      context: {
        accountName: "Choose an ad account",
        dateRangeLabel: DEFAULT_RANGE_LABEL,
        dateRangeDetail: `${metaConnection.accounts.length} account${metaConnection.accounts.length === 1 ? "" : "s"} connected`,
        lastSyncedAgo: "—",
        dataSourceLabel: "live_meta",
        dataSourceBadge: "Live Meta data",
        bannerTitle: "Choose an ad account",
        bannerMessage:
          "Select a default ad account in Settings → Integrations to load live overview metrics.",
        canRefreshData: false,
      },
      health: {
        status: "needs_attention",
        statusLabel: "Account required",
        explanation: "Pick which Meta ad account powers your dashboard.",
        chips: [{ label: "No default account", variant: "warning" }],
      },
      kpis: [],
      dailyInsights: [],
      spendChartCaption: "",
      whatChanged: [],
      campaigns: [],
      recommendations: [],
      budgetPacing: null,
      platformBreakdown: [],
      platformInsight: "",
      dataCoverage: [],
      alerts: [],
      aiQuickActions: [],
    };
  }

  if (!metaConnection.organizationId) {
    return buildDemoOverviewData();
  }

  const snapshot = await getLatestMetaOverviewSnapshot(
    supabase,
    metaConnection.organizationId,
    selected.id,
    datePreset,
  );

  const canRefresh = metaConnection.canConnect;
  const presetLabel = labelForOverviewDatePreset(datePreset);

  if (snapshot) {
    const campaignRows = await getLatestMetaCampaignInsights(
      supabase,
      metaConnection.organizationId,
      selected.id,
      datePreset,
    );
    const campaignSignals = buildOverviewCampaignSignals(campaignRows, selected.id);

    const data = mapMetaSnapshotToOverviewData(snapshot, selected, canRefresh, campaignSignals);
    return {
      ...data,
      context: {
        ...data.context,
        dateRangePreset: datePreset,
      },
    };
  }

  const shell = buildMetaOverviewShell(selected, "no_snapshot", {
    bannerTitle: "No Meta data synced yet",
    bannerMessage: `No cached data for "${presetLabel}". Refresh to load metrics from Meta for this date range.`,
    syncedAt: null,
    canRefreshData: canRefresh,
    dateRange: {
      preset: datePreset,
      start: "",
      end: "",
      label: presetLabel,
      detailLabel: "Not synced for this range yet",
    },
  });
  return {
    ...shell,
    context: { ...shell.context, dateRangePreset: datePreset },
  };
}
