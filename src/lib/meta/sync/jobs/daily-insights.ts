import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import type { MetaEnvConfig } from "@/lib/meta/env";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import { fetchMetaInsights } from "@/lib/meta/sync/fetch-insights";
import { normalizeReportingInsightRow } from "@/lib/meta/sync/normalize-insight";
import {
  insertAccountDailyInsights,
  insertAdDailyInsights,
  insertAdsetDailyInsights,
  insertCampaignDailyInsights,
  insertRawInsightSnapshot,
} from "@/lib/meta/sync/persist";
import { completeMetaSyncRun, createMetaSyncRun, failMetaSyncRun } from "@/lib/meta/sync/sync-run";
import type {
  MetaInsightEntityLevel,
  MetaReportingSyncType,
  MetaSyncAccountContext,
  MetaSyncJobResult,
} from "@/lib/meta/sync/types";

const LEVEL_TO_SYNC_TYPE: Record<MetaInsightEntityLevel, MetaReportingSyncType> = {
  account: "account_daily",
  campaign: "campaign_daily",
  adset: "adset_daily",
  ad: "ad_daily",
};

function insightDateFromRow(row: { date_start?: string; date_stop?: string }): string {
  return row.date_start ?? row.date_stop ?? new Date().toISOString().slice(0, 10);
}

export async function runDailyInsightsSyncJob(
  auth: MetaConnectAuthContext,
  config: MetaEnvConfig,
  accessToken: string,
  ctx: MetaSyncAccountContext,
  level: MetaInsightEntityLevel,
): Promise<MetaSyncJobResult> {
  const syncType = LEVEL_TO_SYNC_TYPE[level];
  let syncRunId: string | undefined;

  try {
    syncRunId = await createMetaSyncRun(auth, ctx.connectedMetaAdAccountId, syncType);

    const fetched = await fetchMetaInsights(
      config,
      accessToken,
      ctx.metaAdAccountId,
      ctx.datePreset,
      level,
      { timeIncrement: 1 },
    );

    const normalized = fetched.rows.map((row) => {
      const metrics = normalizeReportingInsightRow(row, {
        conversionMetricsAvailable: !fetched.usedTrafficOnlyFields,
      });
      return {
        insightDate: insightDateFromRow(row),
        row,
        metrics,
      };
    });

    await insertRawInsightSnapshot(auth.supabase, ctx, {
      syncRunId,
      syncType,
      entityLevel: level,
      dateStart: fetched.dateStart,
      dateEnd: fetched.dateEnd,
      rows: fetched.rows,
      truncated: fetched.truncated,
    });

    let rowCount = 0;
    if (level === "account") {
      rowCount = await insertAccountDailyInsights(auth.supabase, ctx, {
        syncRunId,
        rows: normalized,
      });
    } else if (level === "campaign") {
      rowCount = await insertCampaignDailyInsights(auth.supabase, ctx, {
        syncRunId,
        rows: normalized,
      });
    } else if (level === "adset") {
      rowCount = await insertAdsetDailyInsights(auth.supabase, ctx, {
        syncRunId,
        rows: normalized,
      });
    } else {
      rowCount = await insertAdDailyInsights(auth.supabase, ctx, {
        syncRunId,
        rows: normalized,
      });
    }

    await completeMetaSyncRun(auth, syncRunId);
    return { syncType, ok: true, syncRunId, rowCount, truncated: fetched.truncated };
  } catch (err) {
    const code = err instanceof MetaExplorerError ? err.code : "META_API_ERROR";
    const message =
      err instanceof MetaExplorerError ? err.message : "Daily insights sync failed.";
    if (syncRunId) {
      await failMetaSyncRun(auth, syncRunId, code, message);
    }
    return { syncType, ok: false, syncRunId, error: { code, message } };
  }
}
