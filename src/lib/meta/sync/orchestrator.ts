import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import { getMetaEnvConfig, MetaConfigError } from "@/lib/meta/env";
import { runMetaOverviewSync, resolveSelectedConnectedAdAccount } from "@/lib/meta/overview-sync";
import {
  resolveOverviewDatePreset,
  type MetaOverviewDatePresetId,
} from "@/lib/meta/overview-date-presets";
import {
  assertAdAccountForOrganization,
  normalizeActAdAccountId,
  resolveMetaAccessToken,
} from "@/lib/meta/explorer-token";
import { runDailyInsightsSyncJob } from "@/lib/meta/sync/jobs/daily-insights";
import { runEntityInsightsSyncJob } from "@/lib/meta/sync/jobs/entity-insights";
import { runAllBreakdownSyncJobs } from "@/lib/meta/sync/jobs/breakdown-insights";
import { runCreativesSyncJob } from "@/lib/meta/sync/jobs/creatives";
import {
  META_REPORTING_SYNC_JOBS,
  type MetaReportingSyncType,
  type MetaSyncAccountContext,
  type MetaSyncJobResult,
} from "@/lib/meta/sync/types";

export type MetaReportingSyncOptions = {
  adAccountId?: string;
  datePreset?: string | null;
  jobs?: MetaReportingSyncType[];
  includeOverview?: boolean;
};

export type MetaReportingSyncResult = {
  ok: boolean;
  datePreset: MetaOverviewDatePresetId;
  jobs: MetaSyncJobResult[];
  overview?: Awaited<ReturnType<typeof runMetaOverviewSync>>;
};

const BREAKDOWN_SYNC_TYPES: MetaReportingSyncType[] = [
  "breakdown_platform",
  "breakdown_platform_position",
  "breakdown_device",
  "breakdown_demographics",
  "breakdown_geo",
];

function resolveJobs(input?: MetaReportingSyncType[]): MetaReportingSyncType[] {
  if (!input?.length) return [...META_REPORTING_SYNC_JOBS];
  return input.filter((j) => META_REPORTING_SYNC_JOBS.includes(j));
}

export async function runMetaReportingSync(
  auth: MetaConnectAuthContext,
  options?: MetaReportingSyncOptions,
): Promise<MetaReportingSyncResult> {
  const datePreset = resolveOverviewDatePreset(options?.datePreset);
  const jobs = resolveJobs(options?.jobs);
  const results: MetaSyncJobResult[] = [];

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
    selected = (data as typeof selected) ?? selected;
  }

  if (!selected) {
    return {
      ok: false,
      datePreset,
      jobs: [
        {
          syncType: "overview",
          ok: false,
          error: {
            code: "NO_AD_ACCOUNT_SELECTED",
            message: "Choose an ad account before running reporting sync.",
          },
        },
      ],
    };
  }

  let config;
  try {
    config = getMetaEnvConfig();
  } catch (err) {
    const message = err instanceof MetaConfigError ? err.message : "Meta is not configured.";
    return {
      ok: false,
      datePreset,
      jobs: [{ syncType: "overview", ok: false, error: { code: "CONFIG_ERROR", message } }],
    };
  }

  const accessToken = await resolveMetaAccessToken(auth);
  const ctx: MetaSyncAccountContext = {
    organizationId: auth.organizationId,
    connectedMetaAdAccountId: selected.id,
    metaAdAccountId: selected.meta_ad_account_id,
    datePreset,
  };

  let overviewResult: Awaited<ReturnType<typeof runMetaOverviewSync>> | undefined;

  if ((options?.includeOverview ?? true) && jobs.includes("overview")) {
    overviewResult = await runMetaOverviewSync(auth, {
      adAccountId: selected.meta_ad_account_id,
      datePreset,
    });
    if (overviewResult.ok) {
      results.push({ syncType: "overview", ok: true });
    } else if ("throttled" in overviewResult && overviewResult.throttled) {
      results.push({
        syncType: "overview",
        ok: false,
        error: { code: "THROTTLED", message: overviewResult.message },
      });
    } else {
      results.push({
        syncType: "overview",
        ok: false,
        error: {
          code: overviewResult.error.code,
          message: overviewResult.error.message,
        },
      });
    }
  }

  if (jobs.includes("account_daily")) {
    results.push(await runDailyInsightsSyncJob(auth, config, accessToken, ctx, "account"));
  }
  if (jobs.includes("campaign_insights")) {
    results.push(await runEntityInsightsSyncJob(auth, config, accessToken, ctx, "campaign"));
  }
  if (jobs.includes("adset_insights")) {
    results.push(await runEntityInsightsSyncJob(auth, config, accessToken, ctx, "adset"));
  }
  if (jobs.includes("ad_insights")) {
    results.push(await runEntityInsightsSyncJob(auth, config, accessToken, ctx, "ad"));
  }
  if (jobs.includes("campaign_daily")) {
    results.push(await runDailyInsightsSyncJob(auth, config, accessToken, ctx, "campaign"));
  }
  if (jobs.includes("adset_daily")) {
    results.push(await runDailyInsightsSyncJob(auth, config, accessToken, ctx, "adset"));
  }
  if (jobs.includes("ad_daily")) {
    results.push(await runDailyInsightsSyncJob(auth, config, accessToken, ctx, "ad"));
  }

  const breakdownJobs = jobs.filter((j) => BREAKDOWN_SYNC_TYPES.includes(j));
  if (breakdownJobs.length > 0) {
    results.push(...(await runAllBreakdownSyncJobs(auth, config, accessToken, ctx, breakdownJobs)));
  }

  if (jobs.includes("creatives")) {
    results.push(await runCreativesSyncJob(auth, config, accessToken, ctx));
  }

  const ok = results.every((r) => r.ok);
  return { ok, datePreset, jobs: results, overview: overviewResult };
}
