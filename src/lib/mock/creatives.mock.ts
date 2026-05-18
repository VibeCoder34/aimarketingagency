import type { CreativeAsset } from "@/types";

export const MOCK_CREATIVE_STATS = {
  total: 47,
  topPerformers: 12,
  fatigued: 8,
  aiGenerated: 3,
};

export const MOCK_CREATIVES: CreativeAsset[] = [
  { id: "c-1", name: "Summer Sale — Hero Image v3", format: "image", campaignName: "Summer Sale 2026", roas: 4.8, ctr: 0.036, spend: 12_400, impressions: 412_000, status: "top_performer", ageDays: 18, color: "#dbeafe" },
  { id: "c-2", name: "UGC Testimonial — Sarah M.", format: "video", campaignName: "Retargeting — Cart Abandoners", roas: 4.2, ctr: 0.028, spend: 8_200, impressions: 298_000, status: "top_performer", ageDays: 24, color: "#fce7f3" },
  { id: "c-3", name: "Product Carousel — Best Sellers", format: "carousel", campaignName: "Lookalike — Top Customers", roas: 3.9, ctr: 0.024, spend: 9_100, impressions: 380_000, status: "active", ageDays: 31, color: "#d1fae5" },
  { id: "c-4", name: "Brand Story Video 60s", format: "video", campaignName: "Brand Awareness Q2", roas: 3.1, ctr: 0.019, spend: 14_200, impressions: 748_000, status: "fatigued", ageDays: 34, color: "#fef3c7" },
  { id: "c-5", name: "Flash Sale Countdown", format: "image", campaignName: "Summer Sale 2026", roas: 4.5, ctr: 0.032, spend: 10_800, impressions: 338_000, status: "top_performer", ageDays: 12, color: "#fee2e2" },
  { id: "c-6", name: "Before/After Split", format: "image", campaignName: "Cold Traffic — US 25-45", roas: 2.4, ctr: 0.013, spend: 7_600, impressions: 584_000, status: "paused", ageDays: 19, color: "#e5e7eb" },
  { id: "c-7", name: "Lifestyle Shot — Summer", format: "image", campaignName: "Lookalike — Top Customers", roas: 3.6, ctr: 0.021, spend: 6_400, impressions: 305_000, status: "active", ageDays: 22, color: "#cffafe" },
  { id: "c-8", name: "Founder Story — 30s", format: "video", campaignName: "Brand Awareness Q2", roas: 2.9, ctr: 0.016, spend: 9_800, impressions: 612_000, status: "fatigued", ageDays: 41, color: "#f3e8ff" },
  { id: "c-9", name: "DPA Auto-Generated", format: "carousel", campaignName: "DPA — Dynamic Product Ads", roas: 3.0, ctr: 0.022, spend: 5_820, impressions: 267_000, status: "active", ageDays: 8, color: "#ecfccb" },
  { id: "c-10", name: "UGC Unboxing — Mike T.", format: "video", campaignName: "Retargeting — Cart Abandoners", roas: 4.1, ctr: 0.027, spend: 4_200, impressions: 156_000, status: "top_performer", ageDays: 14, color: "#ffedd5" },
  { id: "c-11", name: "Limited Stock Urgency", format: "image", campaignName: "Cold Traffic — US 25-45", roas: 2.6, ctr: 0.015, spend: 8_100, impressions: 540_000, status: "paused", ageDays: 27, color: "#f1f5f9" },
  { id: "c-12", name: "AI Generated — Concept A", format: "image", campaignName: "Summer Sale 2026", roas: 3.8, ctr: 0.026, spend: 2_100, impressions: 81_000, status: "active", ageDays: 5, aiGenerated: true, color: "#ede9fe" },
];

export const MOCK_CREATIVE_STYLES = ["UGC", "Product Shot", "Lifestyle", "Animated", "Cinematic"] as const;

export const MOCK_CAMPAIGN_OPTIONS = [
  "Summer Sale 2026",
  "Retargeting — Cart Abandoners",
  "Lookalike — Top Customers",
  "Brand Awareness Q2",
];
