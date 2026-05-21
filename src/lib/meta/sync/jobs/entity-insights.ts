import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import type { MetaEnvConfig } from "@/lib/meta/env";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import { fetchMetaInsights } from "@/lib/meta/sync/fetch-insights";
import { normalizeReportingInsightRow } from "@/lib/meta/sync/normalize-insight";
import {
  insertAdInsights,
  insertAdsetInsights,
  insertCampaignInsights,
  insertRawInsightSnapshot,
} from "@/lib/meta/sync/persist";
import { completeMetaSyncRun, createMetaSyncRun, failMetaSyncRun } from "@/lib/meta/sync/sync-run";
import type {
  MetaInsightEntityLevel,
  MetaReportingSyncType,
  MetaSyncAccountContext,
  MetaSyncJobResult,
} from "@/lib/meta/sync/types";

const LEVEL_TO_SYNC_TYPE: Record<
  Exclude<MetaInsightEntityLevel, "account">,
  MetaReportingSyncType
> = {
  campaign: "campaign_insights",
  adset: "adset_insights",
  ad: "ad_insights",
};

export async function runEntityInsightsSyncJob(
  auth: MetaConnectAuthContext,
  config: MetaEnvConfig,
  accessToken: string,
  ctx: MetaSyncAccountContext,
  level: Exclude<MetaInsightEntityLevel, "account">,
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
    );

    const normalized = fetched.rows.map((row) => ({
      row,
      metrics: normalizeReportingInsightRow(row, {
        conversionMetricsAvailable: !fetched.usedTrafficOnlyFields,
      }),
    }));

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
    if (level === "campaign") {
      rowCount = await insertCampaignInsights(auth.supabase, ctx, {
        syncRunId,
        dateStart: fetched.dateStart,
        dateEnd: fetched.dateEnd,
        rows: normalized,
      });
    } else if (level === "adset") {
      rowCount = await insertAdsetInsights(auth.supabase, ctx, {
        syncRunId,
        dateStart: fetched.dateStart,
        dateEnd: fetched.dateEnd,
        rows: normalized,
      });
    } else {
      rowCount = await insertAdInsights(auth.supabase, ctx, {
        syncRunId,
        dateStart: fetched.dateStart,
        dateEnd: fetched.dateEnd,
        rows: normalized,
      });
    }

    await completeMetaSyncRun(auth, syncRunId);
    return { syncType, ok: true, syncRunId, rowCount, truncated: fetched.truncated };
  } catch (err) {
    const code = err instanceof MetaExplorerError ? err.code : "META_API_ERROR";
    const message =
      err instanceof MetaExplorerError ? err.message : "Entity insights sync failed.";
    if (syncRunId) {
      await failMetaSyncRun(auth, syncRunId, code, message);
    }
    return { syncType, ok: false, syncRunId, error: { code, message } };
  }
}
