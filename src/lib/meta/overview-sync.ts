import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import { getMetaEnvConfig, MetaConfigError } from "@/lib/meta/env";
import { fetchMetaAccountOverviewInsights } from "@/lib/meta/overview-insights-fetch";
import {
  resolveOverviewDatePreset,
  type MetaOverviewDatePresetId,
} from "@/lib/meta/overview-date-presets";
import { insertMetaOverviewSnapshot } from "@/lib/meta/overview-snapshots";
import {
  assertAdAccountForOrganization,
  normalizeActAdAccountId,
  resolveMetaAccessToken,
} from "@/lib/meta/explorer-token";

export const META_OVERVIEW_SYNC_THROTTLE_MS = 10 * 60 * 1000;

export type MetaOverviewSyncSuccess = {
  ok: true;
  syncedAt: string;
  snapshotId: string;
};

export type MetaOverviewSyncThrottled = {
  ok: false;
  throttled: true;
  retryAfterSeconds: number;
  retryAt: string;
  message: string;
};

export type MetaOverviewSyncFailure = {
  ok: false;
  throttled?: false;
  error: { code: string; message: string };
};

export type MetaOverviewSyncResult =
  | MetaOverviewSyncSuccess
  | MetaOverviewSyncThrottled
  | MetaOverviewSyncFailure;

type ConnectedAdAccountRow = {
  id: string;
  meta_ad_account_id: string;
  meta_ad_account_name: string;
  currency: string | null;
  is_selected: boolean;
  connection_status: string;
};

export async function resolveSelectedConnectedAdAccount(
  auth: MetaConnectAuthContext,
): Promise<ConnectedAdAccountRow | null> {
  const { data, error } = await auth.supabase
    .from("connected_meta_ad_accounts")
    .select("id, meta_ad_account_id, meta_ad_account_name, currency, is_selected, connection_status")
    .eq("organization_id", auth.organizationId)
    .eq("connection_status", "connected")
    .order("is_selected", { ascending: false })
    .order("meta_ad_account_name", { ascending: true });

  if (error) {
    console.error("[meta/overview-sync] accounts:", error.message);
    return null;
  }

  const rows = (data ?? []) as ConnectedAdAccountRow[];
  return rows.find((row) => row.is_selected) ?? null;
}

async function getRecentOverviewSync(
  auth: MetaConnectAuthContext,
  connectedMetaAdAccountId: string,
) {
  const since = new Date(Date.now() - META_OVERVIEW_SYNC_THROTTLE_MS).toISOString();
  const { data, error } = await auth.supabase
    .from("meta_sync_runs")
    .select("id, started_at, completed_at, status")
    .eq("organization_id", auth.organizationId)
    .eq("connected_meta_ad_account_id", connectedMetaAdAccountId)
    .eq("sync_type", "overview")
    .in("status", ["running", "success"])
    .gte("started_at", since)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[meta/overview-sync] throttle check:", error.message);
    return null;
  }

  return data;
}

export async function runMetaOverviewSync(
  auth: MetaConnectAuthContext,
  options?: { adAccountId?: string; datePreset?: string | null },
): Promise<MetaOverviewSyncResult> {
  const datePreset: MetaOverviewDatePresetId = resolveOverviewDatePreset(options?.datePreset);
  let selected = await resolveSelectedConnectedAdAccount(auth);

  if (options?.adAccountId) {
    const actId = normalizeActAdAccountId(options.adAccountId);
    await assertAdAccountForOrganization(auth, actId);
    const { data } = await auth.supabase
      .from("connected_meta_ad_accounts")
      .select("id, meta_ad_account_id, meta_ad_account_name, currency, is_selected, connection_status")
      .eq("organization_id", auth.organizationId)
      .eq("meta_ad_account_id", actId)
      .eq("connection_status", "connected")
      .maybeSingle();
    selected = (data as ConnectedAdAccountRow | null) ?? selected;
  }

  if (!selected) {
    return {
      ok: false,
      error: {
        code: "NO_AD_ACCOUNT_SELECTED",
        message: "Choose an ad account in Settings before refreshing overview data.",
      },
    };
  }

  const recent = await getRecentOverviewSync(auth, selected.id);
  if (recent) {
    const startedAt = new Date(recent.started_at).getTime();
    const retryAtMs = startedAt + META_OVERVIEW_SYNC_THROTTLE_MS;
    const retryAfterSeconds = Math.max(1, Math.ceil((retryAtMs - Date.now()) / 1000));
    const retryAt = new Date(retryAtMs).toISOString();
    const minutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    return {
      ok: false,
      throttled: true,
      retryAfterSeconds,
      retryAt,
      message: `Data was refreshed recently. You can refresh again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const { data: syncRun, error: syncRunError } = await auth.supabase
    .from("meta_sync_runs")
    .insert({
      organization_id: auth.organizationId,
      connected_meta_ad_account_id: selected.id,
      sync_type: "overview",
      status: "running",
      requested_by_user_id: auth.userId,
    })
    .select("id")
    .single();

  if (syncRunError || !syncRun) {
    console.error("[meta/overview-sync] create run:", syncRunError?.message);
    return {
      ok: false,
      error: {
        code: "SYNC_RUN_FAILED",
        message: "Could not start Meta sync. Please try again.",
      },
    };
  }

  const syncRunId = syncRun.id as string;
  const actId = selected.meta_ad_account_id;

  try {
    let config;
    try {
      config = getMetaEnvConfig();
    } catch (err) {
      const message = err instanceof MetaConfigError ? err.message : "Meta is not configured.";
      throw new MetaExplorerError("CONFIG_ERROR", message);
    }

    const accessToken = await resolveMetaAccessToken(auth);
    const insights = await fetchMetaAccountOverviewInsights(
      config,
      accessToken,
      actId,
      auth.organizationId,
      datePreset,
    );

    const snapshot = await insertMetaOverviewSnapshot(auth.supabase, {
      organizationId: auth.organizationId,
      connectedMetaAdAccountId: selected.id,
      dateRangePreset: datePreset,
      dateStart: insights.dateStart,
      dateEnd: insights.dateEnd,
      metrics: insights.metrics,
      rawResponse: insights.rawRows,
    });

    if (!snapshot) {
      throw new MetaExplorerError(
        "META_API_ERROR",
        "Fetched Meta data but failed to save the snapshot.",
      );
    }

    await auth.supabase
      .from("meta_sync_runs")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
      })
      .eq("id", syncRunId);

    await auth.supabase
      .from("connected_meta_ad_accounts")
      .update({ last_insights_sync_at: snapshot.synced_at })
      .eq("id", selected.id);

    return {
      ok: true,
      syncedAt: snapshot.synced_at,
      snapshotId: snapshot.id,
    };
  } catch (err) {
    const errorCode = err instanceof MetaExplorerError ? err.code : "META_API_ERROR";
    const errorMessage =
      err instanceof MetaExplorerError
        ? err.message
        : "Could not refresh Meta data. Please try again.";

    await auth.supabase
      .from("meta_sync_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_code: errorCode,
        error_message: errorMessage,
      })
      .eq("id", syncRunId);

    return {
      ok: false,
      error: { code: errorCode, message: errorMessage },
    };
  }
}
