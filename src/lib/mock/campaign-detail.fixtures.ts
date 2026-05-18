/**
 * Raw campaign detail fixtures (ad sets, creatives, tips, daily trend builders).
 * Consumed only by the mock data adapter — not by UI components.
 */

import type { AdSet, Creative, DailyStats } from "@/types";

export function buildLast14DailyStats(baseSpend: number, baseRoas: number): DailyStats[] {
  const rows: DailyStats[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 4, 16 - i));
    rows.push({
      date: d.toISOString().slice(0, 10),
      spend: baseSpend / 14 + (i % 4) * 120,
      roas: baseRoas + (i % 3) * 0.05 - 0.05,
      clicks: 8_200 + i * 180,
      impressions: 88_000 + i * 2_400,
      conversions: 420 + (i % 4) * 28,
    });
  }
  return rows;
}

export const DETAIL_AD_SETS: Record<string, AdSet[]> = {
  "cmp-01": [
    { id: "as-1", name: "Broad — US 25-54", audience: "Interest: fashion, shopping", budget: 900, spend: 22_400, roas: 4.6, status: "active" },
    { id: "as-2", name: "Retargeting — 7D visitors", audience: "Website 7D", budget: 600, spend: 12_100, roas: 4.8, status: "active" },
    { id: "as-3", name: "Lookalike 2% purchasers", audience: "LAL 2% buyers", budget: 300, spend: 7_600, roas: 4.2, status: "active" },
  ],
};

export const DETAIL_CREATIVES: Record<string, Creative[]> = {
  "cmp-01": [
    { id: "cr-1", name: "Summer Sale — Hero Image v3", format: "image", spend: 12_400, roas: 4.8, ctr: 0.036, thumbnail: "#e8f4fc" },
    { id: "cr-2", name: "Flash Sale Countdown", format: "image", spend: 10_800, roas: 4.5, ctr: 0.032, thumbnail: "#fef3c7" },
    { id: "cr-3", name: "UGC Testimonial — Sarah M.", format: "video", spend: 8_200, roas: 4.2, ctr: 0.028, thumbnail: "#fce7f3" },
  ],
};

export const DETAIL_TIPS: Record<string, { title: string; description: string }[]> = {
  "cmp-01": [
    { title: "Scale budget by 40%", description: "ROAS has held above 4.0x for 21 days with 78% daily budget utilization." },
    { title: "Test UGC video variant", description: "Image ads lead on CTR; video converts +34% when clicked — test hybrid UGC." },
  ],
  "cmp-05": [
    { title: "Review pause in Ads Manager", description: "ROAS below 3.0x threshold for 14 consecutive days despite creative refreshes." },
    { title: "Reallocate budget manually", description: "Consider shifting budget to Summer Sale or Retargeting in Meta Ads Manager." },
  ],
};

export const DEFAULT_DETAIL_TIPS = [
  { title: "Monitor CTR trend", description: "Watch for creative fatigue signals over the next 7 days." },
  { title: "Review audience overlap", description: "Check for saturation if frequency exceeds 4.0." },
];
