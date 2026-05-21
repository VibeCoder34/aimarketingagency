import type { MetaInsightEntityLevel } from "@/lib/meta/sync/types";

/** Core performance fields requested on insights sync jobs (Phase 1–2). */
export const META_PERFORMANCE_INSIGHT_FIELDS = [
  "spend",
  "impressions",
  "reach",
  "frequency",
  "clicks",
  "ctr",
  "cpc",
  "cpm",
  "actions",
  "action_values",
  "cost_per_action_type",
  "purchase_roas",
  "website_purchase_roas",
  "date_start",
  "date_stop",
] as const;

export const META_TRAFFIC_INSIGHT_FIELDS = [
  "spend",
  "impressions",
  "reach",
  "frequency",
  "clicks",
  "ctr",
  "cpc",
  "cpm",
  "date_start",
  "date_stop",
] as const;

const LEVEL_ID_FIELDS: Record<MetaInsightEntityLevel, string[]> = {
  account: [],
  campaign: ["campaign_id", "campaign_name"],
  adset: ["campaign_id", "campaign_name", "adset_id", "adset_name"],
  ad: ["campaign_id", "campaign_name", "adset_id", "adset_name", "ad_id", "ad_name"],
};

export function buildInsightsFieldList(
  level: MetaInsightEntityLevel,
  options?: { trafficOnly?: boolean },
): string {
  const base = options?.trafficOnly ? META_TRAFFIC_INSIGHT_FIELDS : META_PERFORMANCE_INSIGHT_FIELDS;
  return [...LEVEL_ID_FIELDS[level], ...base].join(",");
}

/** Ad fields for creatives sync — nested creative uses Graph-safe fields only. */
const META_CREATIVE_NESTED_FIELDS = [
  "id",
  "name",
  "thumbnail_url",
  "image_url",
  "object_story_spec",
  "asset_feed_spec",
  "effective_object_story_id",
  "url_tags",
  "call_to_action_type",
  "image_hash",
  "video_id",
].join(",");

export const META_CREATIVE_AD_FIELDS = [
  "id",
  "name",
  "status",
  "campaign_id",
  "adset_id",
  `creative{${META_CREATIVE_NESTED_FIELDS}}`,
].join(",");

/** Minimal fallback if Graph rejects optional creative subfields. */
export const META_CREATIVE_AD_FIELDS_MINIMAL = [
  "id",
  "name",
  "status",
  "campaign_id",
  "adset_id",
  "creative{id,name,thumbnail_url,object_story_spec,asset_feed_spec,call_to_action_type}",
].join(",");
