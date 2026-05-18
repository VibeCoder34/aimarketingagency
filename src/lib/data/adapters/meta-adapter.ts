/**
 * Meta Marketing API adapter (stub).
 *
 * TODO: Implement OAuth-backed Meta integration:
 * - Fetch ad accounts for the authenticated user
 * - Fetch campaigns, ad sets, and ads for the selected ad account
 * - Fetch insights (account, campaign, ad set, ad) with date range + pagination
 * - Map Meta raw responses into AdPilot normalized types (see @/lib/data/types)
 * - Handle missing ROAS when revenue attribution is unavailable
 * - Handle missing or partial conversion/action breakdowns
 * - Respect rate limits and cache/sync timestamps for "last synced"
 * - Support breakdowns (publisher_platform, placement, etc.) where available
 */

import type { CampaignDetailRequestParams, DataRequestParams } from "@/lib/data/params";
import type { CampaignDetailData, CampaignsData, OverviewData, RecommendationData } from "@/lib/data/types";

export class MetaAdapterNotImplementedError extends Error {
  constructor(feature: string) {
    super(
      `Meta adapter not implemented yet (${feature}). Use source: "mock" until Meta OAuth and API sync are enabled.`,
    );
    this.name = "MetaAdapterNotImplementedError";
  }
}

export async function getMetaOverviewData(_params: DataRequestParams): Promise<OverviewData> {
  // TODO: call Meta Insights API → normalize → OverviewData
  throw new MetaAdapterNotImplementedError("getOverviewData");
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
