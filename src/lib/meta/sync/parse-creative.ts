/**
 * Normalizes Meta Ad + AdCreative payloads into DB columns.
 * Text is read from nested object_story_spec / asset_feed_spec — not top-level creative fields.
 */

export type ParsedMetaCreativeRow = {
  adId: string;
  adName: string | null;
  creativeId: string | null;
  thumbnailUrl: string | null;
  bodyText: string | null;
  title: string | null;
  description: string | null;
  callToActionType: string | null;
  objectStorySpec: unknown | null;
  assetFeedSpec: unknown | null;
  imageHash: string | null;
  videoId: string | null;
  rawResponse: Record<string, unknown>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** First non-empty string from candidates. */
function pickFirst(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    const s = pickString(c);
    if (s) return s;
  }
  return null;
}

/** First text from Meta feed spec array fields: bodies, titles, descriptions, etc. */
function pickFromFeedArray(spec: Record<string, unknown> | null, key: string): string | null {
  if (!spec) return null;
  const arr = spec[key];
  if (!Array.isArray(arr)) return null;
  for (const item of arr) {
    if (typeof item === "string") {
      const s = pickString(item);
      if (s) return s;
    }
    const rec = asRecord(item);
    if (rec) {
      const s = pickString(rec.text ?? rec.value ?? rec.title ?? rec.body);
      if (s) return s;
    }
  }
  return null;
}

function extractFromObjectStorySpec(spec: Record<string, unknown> | null): {
  primaryText: string | null;
  headline: string | null;
  descriptionText: string | null;
} {
  if (!spec) {
    return { primaryText: null, headline: null, descriptionText: null };
  }

  const linkData = asRecord(spec.link_data);
  const videoData = asRecord(spec.video_data);
  const templateData = asRecord(spec.template_data);

  return {
    primaryText: pickFirst(
      linkData?.message,
      videoData?.message,
      templateData?.message,
      asRecord(templateData?.child_attachments)?.message,
    ),
    headline: pickFirst(linkData?.name, videoData?.title, templateData?.name),
    descriptionText: pickFirst(linkData?.description, videoData?.link_description),
  };
}

function extractFromAssetFeedSpec(spec: Record<string, unknown> | null): {
  primaryText: string | null;
  headline: string | null;
  descriptionText: string | null;
} {
  if (!spec) {
    return { primaryText: null, headline: null, descriptionText: null };
  }

  return {
    primaryText: pickFromFeedArray(spec, "bodies") ?? pickFromFeedArray(spec, "body"),
    headline: pickFromFeedArray(spec, "titles") ?? pickFromFeedArray(spec, "title"),
    descriptionText: pickFromFeedArray(spec, "descriptions") ?? pickFromFeedArray(spec, "description"),
  };
}

export function parseCreativeFromAdRow(row: Record<string, unknown>): ParsedMetaCreativeRow | null {
  const adId = row.id != null ? String(row.id) : "";
  if (!adId) return null;

  const creative = asRecord(row.creative) ?? {};
  const objectStorySpec = creative.object_story_spec ?? null;
  const assetFeedSpec = creative.asset_feed_spec ?? null;
  const story = extractFromObjectStorySpec(asRecord(objectStorySpec));
  const feed = extractFromAssetFeedSpec(asRecord(assetFeedSpec));

  const adName = pickFirst(row.name, creative.name);
  const thumbnailUrl = pickString(creative.thumbnail_url) ?? pickString(creative.image_url);

  return {
    adId,
    adName,
    creativeId: creative.id != null ? String(creative.id) : null,
    thumbnailUrl,
    bodyText: pickFirst(story.primaryText, feed.primaryText),
    title: pickFirst(story.headline, feed.headline),
    description: pickFirst(story.descriptionText, feed.descriptionText),
    callToActionType: pickString(creative.call_to_action_type),
    objectStorySpec,
    assetFeedSpec,
    imageHash: pickString(creative.image_hash),
    videoId: creative.video_id != null ? String(creative.video_id) : null,
    rawResponse: row,
  };
}
