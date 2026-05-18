import type {
  CampaignSignal,
  NormalizedCampaign,
  NormalizedCampaignListItem,
  NormalizedCampaignSummary,
} from "@/lib/data/types";

const SIGNAL_LABELS: Record<CampaignSignal, string> = {
  scaling_opportunity: "Scaling Opportunity",
  needs_attention: "Needs Attention",
  wasted_spend: "Wasted Spend",
  creative_refresh: "Creative Refresh Needed",
  stable: "Stable",
  limited_data: "Limited Data",
};

const SIGNAL_VARIANTS: Record<
  CampaignSignal,
  "success" | "warning" | "danger" | "default" | "muted"
> = {
  scaling_opportunity: "success",
  needs_attention: "warning",
  wasted_spend: "danger",
  creative_refresh: "warning",
  stable: "muted",
  limited_data: "default",
};

const ATTENTION_SIGNALS: CampaignSignal[] = [
  "needs_attention",
  "wasted_spend",
  "creative_refresh",
  "limited_data",
];

export function hasLimitedData(campaign: NormalizedCampaign): boolean {
  if (campaign.aiHealthScore == null) return true;
  if (campaign.roas === 0 && campaign.spend > 0) return true;
  if ((campaign.conversions ?? 0) === 0 && campaign.spend > 0) return true;
  if (campaign.status === "learning" && (campaign.conversions ?? 0) < 100) return true;
  return false;
}

export function resolveCampaignSignal(campaign: NormalizedCampaign): CampaignSignal {
  if (hasLimitedData(campaign)) {
    return "limited_data";
  }
  if (campaign.status === "paused" && campaign.roas < 3) {
    return "wasted_spend";
  }
  if (campaign.id === "cmp-04" || campaign.name.includes("Brand Awareness")) {
    return campaign.roas <= 3 ? "creative_refresh" : "stable";
  }
  if (campaign.roas >= 4) {
    return "scaling_opportunity";
  }
  if (campaign.roas < 3) {
    return "needs_attention";
  }
  if (campaign.roas >= 3.5) {
    return "stable";
  }
  return "needs_attention";
}

export function buildManualActionNote(campaign: NormalizedCampaign, signal: CampaignSignal): string {
  switch (signal) {
    case "scaling_opportunity":
      return `Review scale opportunity for "${campaign.name}" manually in Meta Ads Manager before increasing budget. AdPilot does not change budgets.`;
    case "wasted_spend":
      return `Consider pausing or reducing "${campaign.name}" in Meta Ads Manager — suggested manual action only.`;
    case "creative_refresh":
      return `Refresh creatives for "${campaign.name}" in Meta Ads Manager; CTR fatigue may be affecting results.`;
    case "limited_data":
      return `Limited data for "${campaign.name}" — verify conversion tracking and attribution in Meta before making changes.`;
    case "needs_attention":
      return `Review performance and budget for "${campaign.name}" manually in Meta Ads Manager.`;
    case "stable":
      return `Monitor "${campaign.name}" — no urgent manual changes suggested this period.`;
  }
}

export function computeCpa(campaign: NormalizedCampaign): number | null {
  const conversions = campaign.conversions ?? 0;
  if (conversions <= 0) return null;
  return campaign.spend / conversions;
}

export function enrichCampaignListItem(campaign: NormalizedCampaign): NormalizedCampaignListItem {
  const signal = resolveCampaignSignal(campaign);
  return {
    ...campaign,
    cpa: campaign.cpa ?? computeCpa(campaign),
    signal,
    manualActionNote: buildManualActionNote(campaign, signal),
  };
}

export function attachCampaignSignals(campaigns: NormalizedCampaign[]): NormalizedCampaignSummary[] {
  return campaigns.map(enrichCampaignListItem);
}

export function getCampaignSignalLabel(signal: CampaignSignal): string {
  return SIGNAL_LABELS[signal];
}

export function getCampaignSignalVariant(
  signal: CampaignSignal,
): "success" | "warning" | "danger" | "default" | "muted" {
  return SIGNAL_VARIANTS[signal];
}

export function isNeedsAttentionSignal(signal: CampaignSignal): boolean {
  return ATTENTION_SIGNALS.includes(signal);
}

export type CampaignTab = "winners" | "attention" | "spend";

export function filterCampaignsByTab(
  campaigns: NormalizedCampaignSummary[],
  tab: CampaignTab,
): NormalizedCampaignSummary[] {
  switch (tab) {
    case "winners":
      return [...campaigns].filter((c) => c.roas >= 3.6 && c.signal !== "limited_data").sort((a, b) => b.roas - a.roas);
    case "attention":
      return [...campaigns]
        .filter((c) => isNeedsAttentionSignal(c.signal))
        .sort((a, b) => a.roas - b.roas);
    case "spend":
      return [...campaigns].sort((a, b) => b.spend - a.spend);
    default:
      return campaigns;
  }
}
