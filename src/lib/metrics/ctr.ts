/**
 * CTR convention for Meta Ads reporting data:
 * - `ctr` is always stored and passed around as **percentage points** (4.36 means 4.36%).
 * - Meta Insights API returns ctr already as a percentage (e.g. "4.3599" → 4.3599%).
 * - When computing from clicks/impressions: (clicks / impressions) * 100.
 *
 * Do NOT multiply Meta ctr by 100. Use `formatPercentagePoints` to display, not `formatPercent`
 * (which expects a decimal ratio 0.0436 → 4.36%).
 */

export const CTR_SUSPICIOUS_THRESHOLD = 100;

export function parseMetricNumber(value: string | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Normalize Meta Insights `ctr` field (already percentage points). */
export function normalizeMetaCtr(
  rawCtr: string | undefined,
  options?: { clicks?: number; impressions?: number },
): number {
  const clicks = options?.clicks ?? 0;
  const impressions = options?.impressions ?? 0;

  if (rawCtr != null && rawCtr !== "") {
    const parsed = parseMetricNumber(rawCtr);
    if (isSuspiciousCtr(parsed, clicks, impressions)) {
      const calculated = ctrFromClicksAndImpressions(clicks, impressions);
      if (calculated != null) return calculated;
    }
    return parsed;
  }

  return ctrFromClicksAndImpressions(clicks, impressions) ?? 0;
}

/** clicks / impressions × 100 → percentage points. */
export function ctrFromClicksAndImpressions(
  clicks: number,
  impressions: number,
): number | null {
  if (impressions <= 0 || clicks < 0) return null;
  return (clicks / impressions) * 100;
}

/**
 * Convert legacy decimal-ratio CTR (0.0436) to percentage points (4.36).
 * Values already > 1 are treated as percentage points.
 */
export function ctrRatioToPercentagePoints(ratioOrPercent: number): number {
  if (!Number.isFinite(ratioOrPercent) || ratioOrPercent <= 0) return 0;
  if (ratioOrPercent <= 1) return ratioOrPercent * 100;
  return ratioOrPercent;
}

export function isSuspiciousCtr(
  ctrPercentagePoints: number,
  clicks?: number,
  impressions?: number,
): boolean {
  if (ctrPercentagePoints > CTR_SUSPICIOUS_THRESHOLD) return true;
  if (
    clicks != null &&
    impressions != null &&
    impressions > 0 &&
    clicks > impressions
  ) {
    return true;
  }
  return false;
}

/** Format percentage points for display: 4.3599 → "4.36%". */
export function formatCtrPercentagePoints(
  ctrPercentagePoints: number,
  fractionDigits = 2,
): string {
  if (!Number.isFinite(ctrPercentagePoints)) return "—";
  return `${ctrPercentagePoints.toFixed(fractionDigits)}%`;
}
