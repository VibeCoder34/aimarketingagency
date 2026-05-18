import type { PlatformBreakdown, SpendChartPoint } from "@/types";
import { MOCK_CAMPAIGNS } from "@/lib/mock/campaigns.mock";

export const MOCK_ANALYTICS_KPIS = [
  { label: "Total Spend", value: "$164,820", delta: "+6.4% vs prior period", direction: "up" as const },
  { label: "Total Revenue", value: "$563,680", delta: "+11.2% vs prior period", direction: "up" as const },
  { label: "Blended ROAS", value: "3.42x", delta: "-0.08x vs prior period", direction: "down" as const },
  { label: "Total Clicks", value: "892,400", delta: "+4.8% vs prior period", direction: "up" as const },
  { label: "Avg CPM", value: "$12.40", delta: "-2.1% vs prior period", direction: "up" as const },
  { label: "Avg CPC", value: "$1.08", delta: "+1.3% vs prior period", direction: "down" as const },
];

function build30DayTrend(): SpendChartPoint[] {
  const rows: SpendChartPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.UTC(2026, 3, 16 + (29 - i)));
    rows.push({
      date: d.toISOString().slice(0, 10),
      spend: 4_800 + (i % 7) * 380 + (i % 5) * 220,
      roas: 3.1 + (i % 6) * 0.06,
    });
  }
  return rows;
}

export const MOCK_ANALYTICS_TREND = build30DayTrend();

export const MOCK_ANALYTICS_CAMPAIGNS = MOCK_CAMPAIGNS.map((c) => ({
  name: c.name,
  spend: c.spend,
  revenue: c.revenue,
  roas: c.roas,
  impressions: c.impressions,
  clicks: c.clicks,
  ctr: c.ctr,
  cpc: c.cpc,
  cpm: c.impressions > 0 ? (c.spend / c.impressions) * 1000 : 0,
  convRate: c.conversionRate,
}));

export const MOCK_ANALYTICS_PLATFORMS: PlatformBreakdown[] = [
  { platform: "Facebook", spend: 98_892, percent: 60, roas: 3.48, clicks: 535_440, cpm: 11.8 },
  { platform: "Instagram", spend: 65_928, percent: 40, roas: 3.32, clicks: 356_960, cpm: 13.2 },
];

export const MOCK_AUDIENCE_PERFORMANCE = [
  { type: "Retargeting Audiences", campaigns: 2, spend: 24_420, roas: 4.2, reach: 180_000 },
  { type: "Lookalike Audiences", campaigns: 2, spend: 27_520, roas: 3.75, reach: 620_000 },
  { type: "Broad/Interest Targeting", campaigns: 3, spend: 76_080, roas: 2.85, reach: 3_200_000 },
  { type: "Dynamic Audiences (DPA)", campaigns: 1, spend: 5_820, roas: 3.0, reach: 267_000 },
];

export const MOCK_CREATIVE_TYPE_SUMMARY = [
  { type: "Image", count: 6, avgRoas: 3.62, avgCtr: 0.024, spend: 67_400 },
  { type: "Video", count: 4, avgRoas: 3.48, avgCtr: 0.021, spend: 56_200 },
  { type: "Carousel", count: 2, avgRoas: 3.45, avgCtr: 0.023, spend: 14_920 },
];

export const MOCK_AI_IMPACT_TIMELINE = [
  { date: "Apr 15", action: 'Paused "Cold Traffic v1"', impact: "ROAS improved from 2.1x to 2.8x blended (+0.7x)" },
  { date: "Apr 22", action: 'Scaled "Retargeting" budget', impact: "Revenue +$18,400 that month" },
  { date: "May 3", action: 'Refreshed creative on "Brand Awareness"', impact: "CTR recovered from 1.1% to 1.9%" },
];
