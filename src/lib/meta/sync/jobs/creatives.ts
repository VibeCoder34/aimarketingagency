import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import type { MetaEnvConfig } from "@/lib/meta/env";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";
import {
  META_CREATIVE_AD_FIELDS,
  META_CREATIVE_AD_FIELDS_MINIMAL,
} from "@/lib/meta/sync/fields";
import { META_SYNC_MAX_PAGES } from "@/lib/meta/sync/fetch-insights";
import { insertMetaCreatives, insertRawInsightSnapshot } from "@/lib/meta/sync/persist";
import { completeMetaSyncRun, createMetaSyncRun, failMetaSyncRun } from "@/lib/meta/sync/sync-run";
import type { MetaSyncAccountContext, MetaSyncJobResult } from "@/lib/meta/sync/types";
import { estimateDateRangeForPreset } from "@/lib/meta/overview-date-presets";

function graphBase(config: MetaEnvConfig) {
  return `https://graph.facebook.com/${config.graphVersion}`;
}

function isUnsupportedFieldError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("nonexisting field") ||
    lower.includes("non-existent field") ||
    lower.includes("does not exist") ||
    lower.includes("unknown field")
  );
}

async function fetchAdsWithCreatives(
  config: MetaEnvConfig,
  accessToken: string,
  actId: string,
  fields: string,
): Promise<{ rows: Record<string, unknown>[]; truncated: boolean }> {
  const params = new URLSearchParams({
    fields,
    access_token: accessToken,
    limit: "100",
  });

  let url: string | null = `${graphBase(config)}/${actId}/ads?${params.toString()}`;
  const combined: Record<string, unknown>[] = [];
  let pages = 0;
  let truncated = false;

  while (url && pages < META_SYNC_MAX_PAGES) {
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const body = (await res.json()) as {
      data?: Record<string, unknown>[];
      paging?: { next?: string };
      error?: { message?: string; code?: number };
    };

    if (!res.ok || body.error) {
      throw new MetaExplorerError(
        "META_API_ERROR",
        body.error?.message ?? `HTTP ${res.status}`,
        body.error?.code,
      );
    }

    combined.push(...(body.data ?? []));
    pages += 1;
    url = body.paging?.next ?? null;
  }

  if (url) truncated = true;
  return { rows: combined, truncated };
}

async function fetchAdsWithCreativesResilient(
  config: MetaEnvConfig,
  accessToken: string,
  actId: string,
): Promise<{ rows: Record<string, unknown>[]; truncated: boolean }> {
  const fieldSets = [META_CREATIVE_AD_FIELDS, META_CREATIVE_AD_FIELDS_MINIMAL];

  let lastError: MetaExplorerError | null = null;
  for (const fields of fieldSets) {
    try {
      return await fetchAdsWithCreatives(config, accessToken, actId, fields);
    } catch (err) {
      if (err instanceof MetaExplorerError) {
        lastError = err;
        if (isUnsupportedFieldError(err.message)) {
          console.warn("[meta/creatives] retry with reduced fields:", err.message);
          continue;
        }
      }
      throw err;
    }
  }

  throw lastError ?? new MetaExplorerError("META_API_ERROR", "Could not fetch ads with creatives.");
}

export async function runCreativesSyncJob(
  auth: MetaConnectAuthContext,
  config: MetaEnvConfig,
  accessToken: string,
  ctx: MetaSyncAccountContext,
): Promise<MetaSyncJobResult> {
  const syncType = "creatives" as const;
  let syncRunId: string | undefined;
  const bounds = estimateDateRangeForPreset(ctx.datePreset);

  try {
    syncRunId = await createMetaSyncRun(auth, ctx.connectedMetaAdAccountId, syncType);
    const { rows, truncated } = await fetchAdsWithCreativesResilient(
      config,
      accessToken,
      ctx.metaAdAccountId,
    );

    await insertRawInsightSnapshot(auth.supabase, ctx, {
      syncRunId,
      syncType,
      dateStart: bounds.start,
      dateEnd: bounds.end,
      rows,
      truncated,
    });

    const rowCount = await insertMetaCreatives(auth.supabase, ctx, {
      syncRunId,
      rows,
    });

    await auth.supabase
      .from("connected_meta_ad_accounts")
      .update({ last_campaigns_sync_at: new Date().toISOString() })
      .eq("id", ctx.connectedMetaAdAccountId);

    await completeMetaSyncRun(auth, syncRunId);
    return { syncType, ok: true, syncRunId, rowCount, truncated };
  } catch (err) {
    const code = err instanceof MetaExplorerError ? err.code : "META_API_ERROR";
    const message = err instanceof MetaExplorerError ? err.message : "Creatives sync failed.";
    if (syncRunId) {
      await failMetaSyncRun(auth, syncRunId, code, message);
    }
    return { syncType, ok: false, syncRunId, error: { code, message } };
  }
}
