import type { AlertFeedItem } from "@/types";

export const MOCK_ALERT_SUMMARY = {
  urgent: 3,
  high: 5,
  medium: 4,
  total: 12,
};

export const MOCK_ALERTS: AlertFeedItem[] = [
  { id: "a-1", severity: "urgent", category: "budget", icon: "🔴", title: "Budget Alert", description: '"Cold Traffic — US 25-45" is projected to exhaust its monthly budget 8 days early', campaignName: "Cold Traffic — US 25-45", timeAgo: "2 hours ago", isRead: false, isResolved: false },
  { id: "a-2", severity: "urgent", category: "roas", icon: "🔴", title: "ROAS Alert", description: "Blended ROAS dropped below 3.0x threshold for the first time this month", campaignName: "Account-wide", timeAgo: "5 hours ago", isRead: false, isResolved: false },
  { id: "a-3", severity: "urgent", category: "creative", icon: "🔴", title: "Creative Fatigue", description: '"Brand Story Video 60s" has a frequency of 6.2 — users are seeing this ad too often', campaignName: "Brand Awareness Q2", timeAgo: "1 day ago", isRead: false, isResolved: false },
  { id: "a-4", severity: "high", category: "cpc", icon: "🟠", title: "CPC Spike", description: 'CPC increased 34% in the last 48 hours on "Lookalike — Top Customers"', campaignName: "Lookalike — Top Customers", timeAgo: "3 hours ago", isRead: false, isResolved: false },
  { id: "a-5", severity: "high", category: "ctr", icon: "🟠", title: "CTR Drop", description: 'CTR on "Brand Awareness Q2" fell below 1.5% — creative fatigue likely', campaignName: "Brand Awareness Q2", timeAgo: "6 hours ago", isRead: true, isResolved: false },
  { id: "a-6", severity: "high", category: "pacing", icon: "🟠", title: "Budget Pacing", description: '"Summer Sale 2026" is overpacing — 94% of monthly budget used with 13 days remaining', campaignName: "Summer Sale 2026", timeAgo: "8 hours ago", isRead: true, isResolved: false },
  { id: "a-7", severity: "high", category: "audience", icon: "🟠", title: "Audience Saturation", description: "Retargeting audience 91% saturated — reach is declining", campaignName: "Retargeting — Cart Abandoners", timeAgo: "1 day ago", isRead: true, isResolved: false },
  { id: "a-8", severity: "medium", category: "learning", icon: "🟡", title: "Learning Phase", description: '"DPA — Dynamic Product Ads" entered learning phase after recent changes', campaignName: "DPA — Dynamic Product Ads", timeAgo: "2 days ago", isRead: true, isResolved: false },
  { id: "a-9", severity: "medium", category: "competitor", icon: "🟡", title: "New Competitor Activity", description: "Estimated CPM increase in your target audience — possible competitor spend increase", campaignName: "Account-wide", timeAgo: "2 days ago", isRead: true, isResolved: false },
  { id: "a-10", severity: "medium", category: "creative", icon: "🟡", title: "Creative Performance", description: '"Before/After Split" image has below-average CTR (1.3%) — consider replacing', campaignName: "Cold Traffic — US 25-45", timeAgo: "3 days ago", isRead: true, isResolved: false },
  { id: "a-11", severity: "medium", category: "conversion", icon: "🟡", title: "Conversion Drop", description: 'Conversion rate on "Lookalike" dropped from 3.8% to 2.4% in last 7 days', campaignName: "Lookalike — Top Customers", timeAgo: "3 days ago", isRead: true, isResolved: false },
  { id: "a-12", severity: "low", category: "report", icon: "⚪", title: "Report Ready", description: "Your Weekly Performance Summary has been generated and is ready to download", campaignName: "—", timeAgo: "4 days ago", isRead: true, isResolved: false },
];
