import type { MetaEnvConfig } from "@/lib/meta/env";
import {
  META_EXPLORER_INSIGHTS_DATE_PRESET,
  type MetaExplorerOperation,
} from "@/lib/meta/explorer-operations";
import { MetaExplorerError } from "@/lib/meta/explorer-errors";

/** Cap pagination depth per explorer request. TODO: replace with robust sync pagination. */
export const META_EXPLORER_MAX_PAGES = 5;

type MetaGraphError = {
  message?: string;
  type?: string;
  code?: number;
};

type MetaPagingBody<T> = {
  data?: T[];
  paging?: { next?: string; previous?: string };
  error?: MetaGraphError;
};

export type MetaExplorerFetchResult = {
  data: unknown[];
  pagesFetched: number;
  truncated: boolean;
};

function graphBase(config: MetaEnvConfig) {
  return `https://graph.facebook.com/${config.graphVersion}`;
}

function mapMetaGraphError(error: MetaGraphError): MetaExplorerError {
  const code = error.code;
  const message = error.message ?? "Meta API request failed.";

  if (code === 4 || code === 17 || code === 32 || code === 613) {
    return new MetaExplorerError("RATE_LIMITED", "Meta rate limit reached. Try again later.", code);
  }

  if (code === 190 || code === 102 || code === 463) {
    return new MetaExplorerError(
      "TOKEN_EXPIRED",
      "Meta token is invalid or expired. Reconnect Meta Ads.",
      code,
    );
  }

  if (code === 10 || code === 200 || code === 294) {
    return new MetaExplorerError("FORBIDDEN", "Permission denied for this Meta request.", code);
  }

  return new MetaExplorerError("META_API_ERROR", message, code);
}

export async function fetchGraphPaginated<T extends Record<string, unknown>>(
  initialUrl: string,
  logContext: { operation: MetaExplorerOperation; organizationId: string; adAccountId?: string },
): Promise<MetaExplorerFetchResult> {
  const combined: T[] = [];
  let nextUrl: string | null = initialUrl;
  let pagesFetched = 0;
  let truncated = false;

  while (nextUrl && pagesFetched < META_EXPLORER_MAX_PAGES) {
    const res = await fetch(nextUrl, { method: "GET", cache: "no-store" });
    const body = (await res.json()) as MetaPagingBody<T>;

    if (!res.ok || body.error) {
      const graphError = body.error ?? { message: `HTTP ${res.status}` };
      console.error(
        "[meta/explorer]",
        logContext.operation,
        "org=",
        logContext.organizationId,
        logContext.adAccountId ? `account=${logContext.adAccountId}` : "",
        "meta_code=",
        graphError.code,
        "meta_message=",
        graphError.message,
      );
      throw mapMetaGraphError(graphError);
    }

    combined.push(...(body.data ?? []));
    pagesFetched += 1;
    nextUrl = body.paging?.next ?? null;
  }

  if (nextUrl) {
    truncated = true;
  }

  return { data: combined, pagesFetched, truncated };
}

function buildExplorerUrl(
  config: MetaEnvConfig,
  accessToken: string,
  operation: MetaExplorerOperation,
  actId: string,
): string {
  const base = graphBase(config);

  if (operation === "ad_accounts") {
    const params = new URLSearchParams({
      fields: "id,name,account_id,account_status,currency,timezone_name",
      access_token: accessToken,
      limit: "200",
    });
    return `${base}/me/adaccounts?${params.toString()}`;
  }

  if (operation === "campaigns") {
    const params = new URLSearchParams({
      fields: "id,name,status,effective_status,objective,created_time,updated_time",
      access_token: accessToken,
      limit: "100",
    });
    return `${base}/${actId}/campaigns?${params.toString()}`;
  }

  const insightsFields: Record<Exclude<MetaExplorerOperation, "ad_accounts" | "campaigns">, string> =
    {
      account_insights:
        "spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,date_start,date_stop",
      campaign_insights:
        "campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,date_start,date_stop",
      adset_insights:
        "campaign_id,campaign_name,adset_id,adset_name,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,date_start,date_stop",
      ad_insights:
        "campaign_id,campaign_name,adset_id,adset_name,ad_id,ad_name,spend,impressions,clicks,ctr,cpc,cpm,reach,frequency,date_start,date_stop",
      daily_insights: "spend,impressions,clicks,ctr,cpc,cpm,date_start,date_stop",
      actions_roas:
        "campaign_id,campaign_name,spend,actions,cost_per_action_type,purchase_roas,website_purchase_roas,date_start,date_stop",
    };

  const params = new URLSearchParams({
    fields: insightsFields[operation as keyof typeof insightsFields],
    date_preset: META_EXPLORER_INSIGHTS_DATE_PRESET,
    access_token: accessToken,
    limit: "100",
  });

  if (operation === "campaign_insights" || operation === "adset_insights" || operation === "ad_insights" || operation === "actions_roas") {
    params.set("level", operation === "actions_roas" ? "campaign" : operation.replace("_insights", ""));
  }

  if (operation === "daily_insights") {
    params.set("time_increment", "1");
  }

  return `${base}/${actId}/insights?${params.toString()}`;
}

export async function runMetaExplorerOperation(
  config: MetaEnvConfig,
  accessToken: string,
  operation: MetaExplorerOperation,
  actId: string | null,
  organizationId: string,
): Promise<MetaExplorerFetchResult> {
  if (operation !== "ad_accounts" && !actId) {
    throw new MetaExplorerError("INVALID_REQUEST", "Select an ad account for this request.");
  }

  const url = buildExplorerUrl(config, accessToken, operation, actId ?? "");
  return fetchGraphPaginated(url, {
    operation,
    organizationId,
    adAccountId: actId ?? undefined,
  });
}
