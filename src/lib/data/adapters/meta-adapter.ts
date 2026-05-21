/**
 * Meta Marketing API adapter.
 * Overview reads cached snapshots via resolveOverviewForPage — not live Meta on page load.
 */

import type { CampaignDetailRequestParams, DataRequestParams } from "@/lib/data/params";
import { resolveOverviewForPage } from "@/lib/data/resolve-overview-data";
import type { CampaignDetailData, CampaignsData, OverviewData, RecommendationData } from "@/lib/data/types";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export class MetaAdapterNotImplementedError extends Error {
  constructor(feature: string) {
    super(
      `Meta adapter not implemented yet (${feature}). Use source: "mock" until Meta OAuth and API sync are enabled.`,
    );
    this.name = "MetaAdapterNotImplementedError";
  }
}

export async function getMetaOverviewData(_params: DataRequestParams): Promise<OverviewData> {
  const metaConnection = await getAdAccountsPageData(isMetaConfigured());
  return resolveOverviewForPage(metaConnection);
}

export async function getMetaCampaignsData(_params: DataRequestParams): Promise<CampaignsData> {
  // TODO: call Meta Campaigns API → normalize → CampaignsData
  throw new MetaAdapterNotImplementedError("getCampaignsData");
}

export async function getMetaCampaignDetailData(_params: CampaignDetailRequestParams): Promise<CampaignDetailData> {
  // TODO: fetch campaign + insights + ad sets + ads for campaignId → normalize → CampaignDetailData
  throw new MetaAdapterNotImplementedError("getCampaignDetailData");
}

export async function getMetaRecommendationsData(_params: DataRequestParams): Promise<RecommendationData> {
  // TODO: consume normalized campaign/ad/adset insights from Meta sync
  // TODO: generate deterministic rule-based recommendations (same engine as mock, different source rows)
  // TODO: optionally pass clean AIContextPayload to LLM later for narrative enrichment only
  // TODO: persist recommendation status (reviewed, planned, done_manually, dismissed) in Supabase later
  throw new MetaAdapterNotImplementedError("getRecommendationsData");
}
