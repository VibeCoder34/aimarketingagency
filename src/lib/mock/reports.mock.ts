import type { PastReport, ReportMetricOption, SavedReportTemplate } from "@/types";

export const MOCK_REPORT_TEMPLATES: SavedReportTemplate[] = [
  { id: "tpl-1", name: "Weekly Performance Summary", lastGenerated: "May 13, 2026", autoSend: "Every Monday 9am", format: "PDF" },
  { id: "tpl-2", name: "Monthly Client Deck", lastGenerated: "May 1, 2026", autoSend: "1st of month", format: "PDF + Google Slides" },
  { id: "tpl-3", name: "ROAS Impact Report", lastGenerated: "May 10, 2026", autoSend: "Manual", format: "PDF" },
];

export const MOCK_PAST_REPORTS: PastReport[] = [
  { id: "r-1", name: "Weekly Performance Summary", type: "automated", dateGenerated: "May 13, 2026", periodCovered: "May 6–13", format: "PDF", status: "sent" },
  { id: "r-2", name: "Weekly Performance Summary", type: "automated", dateGenerated: "May 6, 2026", periodCovered: "Apr 29–May 6", format: "PDF", status: "sent" },
  { id: "r-3", name: "Monthly Client Deck", type: "automated", dateGenerated: "May 1, 2026", periodCovered: "April 2026", format: "PDF + Slides", status: "sent" },
  { id: "r-4", name: "ROAS Impact Report", type: "manual", dateGenerated: "May 10, 2026", periodCovered: "May 1–10", format: "PDF", status: "downloaded" },
  { id: "r-5", name: "Campaign Audit — Q1", type: "manual", dateGenerated: "Apr 2, 2026", periodCovered: "Q1 2026", format: "PDF", status: "downloaded" },
  { id: "r-6", name: "Creative Performance Deep Dive", type: "manual", dateGenerated: "Apr 18, 2026", periodCovered: "Apr 1–18", format: "PDF", status: "downloaded" },
];

export const MOCK_REPORT_METRICS: ReportMetricOption[] = [
  { id: "spend", label: "Spend", category: "performance" },
  { id: "revenue", label: "Revenue", category: "performance" },
  { id: "roas", label: "ROAS", category: "performance" },
  { id: "clicks", label: "Clicks", category: "performance" },
  { id: "ctr", label: "CTR", category: "engagement" },
  { id: "impressions", label: "Impressions", category: "delivery" },
  { id: "cpc", label: "CPC", category: "performance" },
  { id: "cpm", label: "CPM", category: "delivery" },
  { id: "conv_rate", label: "Conversion Rate", category: "performance" },
  { id: "creative_perf", label: "Creative Performance", category: "engagement" },
  { id: "ai_summary", label: "AI Recommendations Summary", category: "performance" },
];

export const MOCK_REPORT_TYPES = [
  "Performance Summary",
  "Campaign Audit",
  "Creative Analysis",
  "ROAS Impact",
  "Custom",
] as const;
