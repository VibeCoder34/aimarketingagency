import { hasLimitedData } from "@/lib/data/campaign-signals";
import type {
  CampaignDataCompleteness,
  CampaignDetailInsight,
  CampaignDetailMetrics,
  CampaignDetailWarning,
  NormalizedCampaign,
} from "@/lib/data/types";

export const CAMPAIGN_DETAIL_READ_ONLY_NOTICE =
  "AdPilot only analyzes this campaign. Apply any changes manually in Meta Ads Manager.";

export function computeCpm(spend: number, impressions: number | undefined): number | null {
  if (!impressions || impressions <= 0) return null;
  return (spend / impressions) * 1000;
}

export function buildCampaignMetrics(campaign: NormalizedCampaign): CampaignDetailMetrics {
  const missingFields: string[] = [];
  const impressions = campaign.impressions ?? null;
  const clicks = campaign.clicks ?? null;
  const conversions = campaign.conversions ?? null;
  const ctr = campaign.ctr ?? null;
  const cpc = campaign.cpc ?? null;
  const cpa =
    campaign.cpa ?? (conversions && conversions > 0 ? campaign.spend / conversions : null);
  const cpm = computeCpm(campaign.spend, impressions ?? undefined);

  if (ctr == null) missingFields.push("ctr");
  if (cpc == null) missingFields.push("cpc");
  if (cpm == null) missingFields.push("cpm");
  if (impressions == null) missingFields.push("impressions");
  if (clicks == null) missingFields.push("clicks");
  if (conversions == null || conversions === 0) missingFields.push("conversions");
  if (cpa == null) missingFields.push("cpa");
  if (campaign.aiHealthScore == null) missingFields.push("aiHealthScore");
  if (campaign.dailyBudget == null) missingFields.push("dailyBudget");

  return {
    spend: campaign.spend,
    revenue: campaign.revenue,
    roas: campaign.roas,
    cpa,
    ctr,
    cpc,
    cpm,
    impressions,
    clicks,
    conversions,
    dailyBudget: campaign.dailyBudget ?? null,
    aiHealthScore: campaign.aiHealthScore ?? null,
    missingFields,
  };
}

export function resolveDataCompleteness(
  campaign: NormalizedCampaign,
  metrics: CampaignDetailMetrics,
): CampaignDataCompleteness {
  if (hasLimitedData(campaign)) return "limited";
  if (metrics.missingFields.length >= 3) return "partial";
  return "full";
}

export function buildCampaignWarnings(
  campaign: NormalizedCampaign,
  metrics: CampaignDetailMetrics,
): CampaignDetailWarning[] {
  const warnings: CampaignDetailWarning[] = [];

  if (hasLimitedData(campaign)) {
    warnings.push({
      id: "limited-data",
      severity: "high",
      title: "Limited data available",
      description:
        "Conversion or revenue signals may be incomplete. Verify tracking in Meta before optimizing.",
    });
  }

  if (campaign.roas > 0 && campaign.roas < 3) {
    warnings.push({
      id: "low-roas",
      severity: campaign.roas < 2.5 ? "urgent" : "high",
      title: "ROAS below efficiency target",
      description: `Current ROAS is ${campaign.roas.toFixed(2)}x — review manually against your account target.`,
    });
  }

  if (campaign.roas === 0 && campaign.spend > 0) {
    warnings.push({
      id: "no-revenue",
      severity: "urgent",
      title: "No attributed revenue",
      description: "Spend is recorded but ROAS is 0 — confirm attribution and conversion setup in Meta.",
    });
  }

  if (metrics.missingFields.includes("conversions")) {
    warnings.push({
      id: "missing-conversions",
      severity: "medium",
      title: "Conversions not available",
      description: "CPA and result volume cannot be calculated for this period.",
    });
  }

  return warnings;
}

export function toReadOnlyInsight(
  tip: { title: string; description: string },
  index: number,
): CampaignDetailInsight {
  let title = tip.title;
  let description = tip.description;

  if (/pause campaign/i.test(title)) {
    title = "Review pause in Meta Ads Manager";
    description = description.replace(/^Pause/i, "Consider reviewing pause");
  }
  if (/scale budget/i.test(title)) {
    title = "Consider scaling manually";
    description = `${description} Apply any budget changes in Meta Ads Manager only.`;
  }

  const variant: CampaignDetailInsight["variant"] =
    /below|fatigue|pause|review/i.test(`${title} ${description}`) ? "warning" : "info";

  return {
    id: `insight-${index}`,
    title,
    description,
    variant,
  };
}

export function buildMetaAdsManagerPlaceholder(metaAdAccountId?: string | null): string | null {
  if (!metaAdAccountId) return null;
  const act = metaAdAccountId.replace(/^act_/, "");
  return `https://www.facebook.com/adsmanager/manage/campaigns?act=${act}`;
}
