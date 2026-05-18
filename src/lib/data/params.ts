import type { DataSourceType, DateRange } from "@/lib/data/types";

export type DataRequestParams = {
  source: DataSourceType;
  accountId: string;
  dateRange: DateRange;
};

export type CampaignDetailRequestParams = DataRequestParams & {
  campaignId: string;
};

export const DEFAULT_MOCK_ACCOUNT_ID = "northwind-media";

export const DEFAULT_MOCK_DATE_RANGE: DateRange = {
  preset: "may-2026-snapshot",
  start: "2026-05-01",
  end: "2026-05-17",
  label: "May 2026 snapshot",
  detailLabel: "May 1–17, 2026",
};
