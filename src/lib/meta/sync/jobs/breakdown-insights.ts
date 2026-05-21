import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import type { MetaEnvConfig } from "@/lib/meta/env";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import { fetchMetaInsights } from "@/lib/meta/sync/fetch-insights";
import { normalizeReportingInsightRow } from "@/lib/meta/sync/normalize-insight";
import {
  insertDemographicBreakdowns,
  insertGeoBreakdowns,
  insertPlatformBreakdowns,
  insertRawInsightSnapshot,
} from "@/lib/meta/sync/persist";
import { completeMetaSyncRun, createMetaSyncRun, failMetaSyncRun } from "@/lib/meta/sync/sync-run";
import type {
  MetaBreakdownKind,
  MetaReportingSyncType,
  MetaSyncAccountContext,
  MetaSyncJobResult,
} from "@/lib/meta/sync/types";

type BreakdownJobConfig = {
  syncType: MetaReportingSyncType;
  breakdownKind: MetaBreakdownKind;
  breakdowns: string;
  trafficOnly?: boolean;
};

const BREAKDOWN_JOBS: BreakdownJobConfig[] = [
  {
    syncType: "breakdown_platform",
    breakdownKind: "publisher_platform",
    breakdowns: "publisher_platform",
  },
  {
    syncType: "breakdown_platform_position",
    breakdownKind: "platform_position",
    breakdowns: "publisher_platform,platform_position",
    trafficOnly: true,
  },
  {
    syncType: "breakdown_device",
    breakdownKind: "device_platform",
    breakdowns: "impression_device",
    trafficOnly: true,
  },
  {
    syncType: "breakdown_demographics",
    breakdownKind: "age_gender",
    breakdowns: "age,gender",
    trafficOnly: true,
  },
  {
    syncType: "breakdown_geo",
    breakdownKind: "country",
    breakdowns: "country",
    trafficOnly: true,
  },
];

export function breakdownJobConfigForSyncType(
  syncType: MetaReportingSyncType,
): BreakdownJobConfig | undefined {
  return BREAKDOWN_JOBS.find((j) => j.syncType === syncType);
}

export async function runBreakdownInsightsSyncJob(
  auth: MetaConnectAuthContext,
  config: MetaEnvConfig,
  accessToken: string,
  ctx: MetaSyncAccountContext,
  job: BreakdownJobConfig,
): Promise<MetaSyncJobResult> {
  let syncRunId: string | undefined;

  try {
    syncRunId = await createMetaSyncRun(auth, ctx.connectedMetaAdAccountId, job.syncType);

    const fetched = await fetchMetaInsights(
      config,
      accessToken,
      ctx.metaAdAccountId,
      ctx.datePreset,
      "account",
      {
        breakdowns: job.breakdowns,
        trafficOnly: job.trafficOnly,
      },
    );

    const normalized = fetched.rows.map((row) => ({
      row,
      metrics: normalizeReportingInsightRow(row, {
        conversionMetricsAvailable: !fetched.usedTrafficOnlyFields,
      }),
    }));

    await insertRawInsightSnapshot(auth.supabase, ctx, {
      syncRunId,
      syncType: job.syncType,
      entityLevel: "account",
      breakdownKind: job.breakdownKind,
      dateStart: fetched.dateStart,
      dateEnd: fetched.dateEnd,
      rows: fetched.rows,
      truncated: fetched.truncated,
    });

    let rowCount = 0;
    if (job.breakdownKind === "age_gender") {
      rowCount = await insertDemographicBreakdowns(auth.supabase, ctx, {
        syncRunId,
        dateStart: fetched.dateStart,
        dateEnd: fetched.dateEnd,
        rows: normalized,
      });
    } else if (job.breakdownKind === "country") {
      rowCount = await insertGeoBreakdowns(auth.supabase, ctx, {
        syncRunId,
        breakdownKind: job.breakdownKind,
        dateStart: fetched.dateStart,
        dateEnd: fetched.dateEnd,
        rows: normalized,
      });
    } else {
      rowCount = await insertPlatformBreakdowns(auth.supabase, ctx, {
        syncRunId,
        breakdownKind: job.breakdownKind,
        dateStart: fetched.dateStart,
        dateEnd: fetched.dateEnd,
        rows: normalized,
      });
    }

    await completeMetaSyncRun(auth, syncRunId);
    return {
      syncType: job.syncType,
      ok: true,
      syncRunId,
      rowCount,
      truncated: fetched.truncated,
    };
  } catch (err) {
    const code = err instanceof MetaExplorerError ? err.code : "META_API_ERROR";
    const message =
      err instanceof MetaExplorerError ? err.message : "Breakdown insights sync failed.";
    if (syncRunId) {
      await failMetaSyncRun(auth, syncRunId, code, message);
    }
    return { syncType: job.syncType, ok: false, syncRunId, error: { code, message } };
  }
}

export async function runAllBreakdownSyncJobs(
  auth: MetaConnectAuthContext,
  config: MetaEnvConfig,
  accessToken: string,
  ctx: MetaSyncAccountContext,
  only?: MetaReportingSyncType[],
): Promise<MetaSyncJobResult[]> {
  const jobs = only
    ? BREAKDOWN_JOBS.filter((j) => only.includes(j.syncType))
    : BREAKDOWN_JOBS;
  const results: MetaSyncJobResult[] = [];
  for (const job of jobs) {
    results.push(await runBreakdownInsightsSyncJob(auth, config, accessToken, ctx, job));
  }
  return results;
}
