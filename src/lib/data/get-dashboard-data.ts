import { buildAIContextPayload } from "@/lib/data/build-ai-context";
import {
  getMockCampaignDetailData,
  getMockCampaignsData,
  getMockOverviewData,
  getMockRecommendationsData,
} from "@/lib/data/adapters/mock-adapter";
import {
  MetaAdapterNotImplementedError,
  getMetaCampaignDetailData,
  getMetaCampaignsData,
  getMetaOverviewData,
  getMetaRecommendationsData,
} from "@/lib/data/adapters/meta-adapter";
import type { CampaignDetailRequestParams, DataRequestParams } from "@/lib/data/params";
import { DEFAULT_MOCK_ACCOUNT_ID, DEFAULT_MOCK_DATE_RANGE } from "@/lib/data/params";
import type {
  AIContextPayload,
  CampaignDetailData,
  CampaignsData,
  OverviewData,
  RecommendationData,
} from "@/lib/data/types";

export type { DataRequestParams } from "@/lib/data/params";
export type {
  AIContextPayload,
  CampaignDetailData,
  CampaignsData,
  OverviewData,
  RecommendationData,
  DataSourceType,
  DateRange,
} from "@/lib/data/types";
export type { CampaignDetailRequestParams } from "@/lib/data/params";

export { buildAIContextPayload } from "@/lib/data/build-ai-context";

/** Default params for the Northwind Media mock scenario */
export function defaultOverviewParams(overrides?: Partial<DataRequestParams>): DataRequestParams {
  return {
    source: "mock",
    accountId: DEFAULT_MOCK_ACCOUNT_ID,
    dateRange: DEFAULT_MOCK_DATE_RANGE,
    ...overrides,
  };
}

/**
 * Loads normalized overview data for the dashboard command center.
 * Mock: synchronous. Meta: async (not implemented).
 */
export function getOverviewData(params: DataRequestParams): OverviewData {
  if (params.source === "mock") {
    return getMockOverviewData(params);
  }
  throw new MetaAdapterNotImplementedError("getOverviewData (sync)");
}

/**
 * Async variant — use when Meta adapter is wired (mock resolves immediately).
 */
export async function getOverviewDataAsync(params: DataRequestParams): Promise<OverviewData> {
  if (params.source === "mock") {
    return getMockOverviewData(params);
  }
  return getMetaOverviewData(params);
}

export function getCampaignsData(params: DataRequestParams): CampaignsData {
  if (params.source === "mock") {
    return getMockCampaignsData(params);
  }
  throw new MetaAdapterNotImplementedError("getCampaignsData (sync)");
}

export async function getCampaignsDataAsync(params: DataRequestParams): Promise<CampaignsData> {
  if (params.source === "mock") {
    return getMockCampaignsData(params);
  }
  return getMetaCampaignsData(params);
}

/**
 * Builds AI-ready context from normalized overview data.
 * Does not call any LLM.
 */
export function getAIContextPayload(params: DataRequestParams): AIContextPayload {
  const overview = getOverviewData(params);
  return buildAIContextPayload(overview);
}

export async function getAIContextPayloadAsync(params: DataRequestParams): Promise<AIContextPayload> {
  const overview = await getOverviewDataAsync(params);
  return buildAIContextPayload(overview);
}

export function getCampaignDetailData(params: CampaignDetailRequestParams): CampaignDetailData {
  if (params.source === "mock") {
    return getMockCampaignDetailData(params);
  }
  throw new MetaAdapterNotImplementedError("getCampaignDetailData (sync)");
}

export async function getCampaignDetailDataAsync(params: CampaignDetailRequestParams): Promise<CampaignDetailData> {
  if (params.source === "mock") {
    return getMockCampaignDetailData(params);
  }
  return getMetaCampaignDetailData(params);
}

export function getRecommendationsData(params: DataRequestParams): RecommendationData {
  if (params.source === "mock") {
    return getMockRecommendationsData(params);
  }
  throw new MetaAdapterNotImplementedError("getRecommendationsData (sync)");
}

export async function getRecommendationsDataAsync(params: DataRequestParams): Promise<RecommendationData> {
  if (params.source === "mock") {
    return getMockRecommendationsData(params);
  }
  return getMetaRecommendationsData(params);
}

/** Helper for campaign detail routes and panels */
export function campaignDetailParams(
  campaignId: string,
  overrides?: Partial<CampaignDetailRequestParams>,
): CampaignDetailRequestParams {
  return {
    ...defaultOverviewParams(),
    campaignId,
    ...overrides,
  };
}
