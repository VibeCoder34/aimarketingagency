import type { CampaignSignal, NormalizedCampaignListItem, NormalizedRecommendation, Recommendation, RecommendationDataSummary, RecommendationImpactEstimate, RecommendationPriority } from "@/lib/data/types";
import { MOCK_AI_RECOMMENDATIONS } from "@/lib/mock/ai-insights.mock";

export const RECOMMENDATION_READ_ONLY_NOTICE =
  "AdPilot does not change campaigns. Review and apply manually in Meta Ads Manager.";

const PRIORITY_ORDER: Record<RecommendationPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SIGNAL_CATEGORY: Record<
  Exclude<CampaignSignal, "stable">,
  NormalizedRecommendation["category"]
> = {
  wasted_spend: "budget",
  scaling_opportunity: "scaling",
  creative_refresh: "creative",
  limited_data: "tracking",
  needs_attention: "budget",
};

const SIGNAL_PRIORITY: Record<
  Exclude<CampaignSignal, "stable">,
  RecommendationPriority
> = {
  wasted_spend: "urgent",
  scaling_opportunity: "high",
  creative_refresh: "high",
  limited_data: "medium",
  needs_attention: "high",
};

const SIGNAL_RISK: Record<Exclude<CampaignSignal, "stable">, NormalizedRecommendation["riskLevel"]> = {
  wasted_spend: "high",
  scaling_opportunity: "medium",
  creative_refresh: "medium",
  limited_data: "low",
  needs_attention: "high",
};

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function buildSignalTitle(campaign: NormalizedCampaignListItem, signal: Exclude<CampaignSignal, "stable">): string {
  switch (signal) {
    case "wasted_spend":
      return `Review campaign spend manually for "${campaign.name}"`;
    case "scaling_opportunity":
      return `Consider a manual budget increase for "${campaign.name}"`;
    case "creative_refresh":
      return `Refresh creatives manually for "${campaign.name}"`;
    case "limited_data":
      return `Verify tracking before changing "${campaign.name}"`;
    case "needs_attention":
      return `Review performance manually for "${campaign.name}"`;
  }
}

function buildSignalImpact(
  campaign: NormalizedCampaignListItem,
  signal: Exclude<CampaignSignal, "stable">,
): RecommendationImpactEstimate {
  const dailySpend = campaign.dailyBudget ?? campaign.spend / 17;
  switch (signal) {
    case "wasted_spend": {
      const monthlySavings = Math.round(dailySpend * 30 * 0.7);
      return {
        summary: `Estimated ~$${formatUsd(monthlySavings)}/mo could be reallocated if spend is reduced manually`,
        monthlySavingsUsd: monthlySavings,
        variant: "danger",
      };
    }
    case "scaling_opportunity": {
      const uplift = Math.round(campaign.revenue * 0.15);
      return {
        summary: `+~$${formatUsd(uplift)} estimated monthly revenue if budget is increased carefully in Ads Manager`,
        monthlyRevenueUpliftUsd: uplift,
        variant: "success",
      };
    }
    case "creative_refresh":
      return {
        summary: "Helps protect ROAS before efficiency erodes further",
        variant: "warning",
      };
    case "limited_data":
      return {
        summary: "Improves decision quality once conversion data is reliable",
        variant: "default",
      };
    case "needs_attention":
      return {
        summary: `ROAS ${campaign.roas.toFixed(2)}x is below the 3.0x account efficiency target`,
        variant: "warning",
      };
  }
}

function buildSignalRecommendation(campaign: NormalizedCampaignListItem): NormalizedRecommendation | null {
  if (campaign.signal === "stable") return null;

  const signal = campaign.signal;
  const category = SIGNAL_CATEGORY[signal];
  const priority = SIGNAL_PRIORITY[signal];
  const impactEstimate = buildSignalImpact(campaign, signal);
  const conversions = campaign.conversions ?? 0;
  const cpa = campaign.cpa ?? (conversions > 0 ? campaign.spend / conversions : null);

  const evidencePoints: NormalizedRecommendation["evidencePoints"] = [
    { label: "ROAS", value: `${campaign.roas.toFixed(2)}x` },
    { label: "Spend MTD", value: `$${formatUsd(campaign.spend)}` },
    { label: "Status", value: campaign.status },
  ];
  if (cpa != null) {
    evidencePoints.push({ label: "CPA", value: `$${cpa.toFixed(2)}` });
  }

  const now = "2026-05-17T14:00:00.000Z";

  return {
    id: `rec-signal-${campaign.id}-${signal}`,
    title: buildSignalTitle(campaign, signal),
    summary: campaign.manualActionNote,
    explanation: `${campaign.manualActionNote} Signal: ${signal.replace(/_/g, " ")}. Based on May 2026 snapshot metrics for this campaign.`,
    priority,
    category,
    status: "new",
    sourceEntityType: "campaign",
    sourceEntityId: campaign.id,
    sourceEntityName: campaign.name,
    evidencePoints,
    impactEstimate,
    riskLevel: SIGNAL_RISK[signal],
    manualAction: {
      summary: campaign.manualActionNote,
      steps: [
        "Open Meta Ads Manager for this ad account.",
        "Locate the campaign and review delivery, budget, and creative performance.",
        "Apply any changes manually — AdPilot will not modify ads or budgets.",
      ],
      metaAdsManagerHint: `Campaign: ${campaign.name}`,
    },
    readOnlyNotice: RECOMMENDATION_READ_ONLY_NOTICE,
    createdAt: now,
    updatedAt: now,
  };
}

/** Maps legacy AI Insights fixture rows into normalized read-only recommendations. */
function mapLegacyCuratedRecommendations(): NormalizedRecommendation[] {
  const titleFixes: Record<string, string> = {
    "ai-1": 'Review campaign spend manually for "Cold Traffic — US 25-45"',
    "ai-2": 'Consider a manual budget increase for "Summer Sale 2026"',
    "ai-3": 'Refresh creatives manually for "Brand Awareness Q2"',
    "ai-4": 'Review audience settings manually for "Retargeting — Cart Abandoners"',
    "ai-5": "Plan UGC video creative tests manually on top campaigns",
    "ai-6": "Review budget allocation manually between Awareness and Conversion campaigns",
    "ai-7": 'Review campaign structure manually for "Lookalike — Top Customers"',
    "ai-8": "Plan Spanish-language creative variants manually",
  };

  const campaignByTitle: Record<string, { id: string; name: string }> = {
    "ai-1": { id: "cmp-05", name: "Cold Traffic — US 25-45" },
    "ai-2": { id: "cmp-01", name: "Summer Sale 2026" },
    "ai-3": { id: "cmp-04", name: "Brand Awareness Q2" },
    "ai-4": { id: "cmp-02", name: "Retargeting — Cart Abandoners" },
    "ai-5": { id: "cmp-01", name: "Summer Sale 2026" },
    "ai-6": { id: "northwind-media", name: "Northwind Media" },
    "ai-7": { id: "cmp-03", name: "Lookalike — Top Customers" },
    "ai-8": { id: "northwind-media", name: "Northwind Media" },
  };

  const savingsById: Record<string, number> = {
    "ai-1": 8_200,
    "ai-6": 18_200,
  };

  const upliftById: Record<string, number> = {
    "ai-2": 12_000,
    "ai-4": 8_000,
    "ai-5": 6_000,
    "ai-8": 4_500,
  };

  const categoryMap: Record<string, NormalizedRecommendation["category"]> = {
    budget: "budget",
    creative: "creative",
    audience: "audience",
    structure: "structure",
    scaling: "scaling",
  };

  return MOCK_AI_RECOMMENDATIONS.map((legacy) => {
    const entity = campaignByTitle[legacy.id] ?? { id: "northwind-media", name: "Northwind Media" };
    const isAccount = entity.id === "northwind-media" && legacy.id !== "ai-1";
    const monthlySavings = savingsById[legacy.id];
    const monthlyUplift = upliftById[legacy.id];
    const variant: RecommendationImpactEstimate["variant"] =
      legacy.priority === "urgent"
        ? "danger"
        : legacy.category === "scaling"
          ? "success"
          : legacy.priority === "high"
            ? "warning"
            : "default";

    const now = "2026-05-17T12:00:00.000Z";

    return {
      id: `rec-curated-${legacy.id}`,
      title: titleFixes[legacy.id] ?? legacy.title,
      summary: legacy.explanation.split(".")[0] ?? legacy.explanation,
      explanation: legacy.explanation,
      priority: legacy.priority,
      category: categoryMap[legacy.category] ?? "budget",
      status: "new" as const,
      sourceEntityType: isAccount ? "account" : "campaign",
      sourceEntityId: entity.id,
      sourceEntityName: entity.name,
      evidencePoints: legacy.dataPoints.map((dp, i) => ({
        label: `Evidence ${i + 1}`,
        value: dp,
      })),
      impactEstimate: {
        summary: legacy.impact,
        monthlySavingsUsd: monthlySavings,
        monthlyRevenueUpliftUsd: monthlyUplift,
        variant,
      },
      riskLevel:
        legacy.priority === "urgent" ? "high" : legacy.priority === "high" ? "medium" : "low",
      manualAction: {
        summary: `Complete this change manually in Meta Ads Manager for ${entity.name}.`,
        steps: [
          "Review the evidence metrics below.",
          "Open Meta Ads Manager and locate the source campaign or account.",
          "Apply the suggested change manually — AdPilot does not modify ads.",
        ],
        metaAdsManagerHint: entity.name,
      },
      readOnlyNotice: RECOMMENDATION_READ_ONLY_NOTICE,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export function buildRecommendationsFromCampaigns(
  campaigns: NormalizedCampaignListItem[],
): NormalizedRecommendation[] {
  return campaigns
    .map(buildSignalRecommendation)
    .filter((r): r is NormalizedRecommendation => r != null);
}

/**
 * Merges signal-derived and curated mock recommendations.
 * Curated items win when they reference the same campaign as a signal row.
 */
export function mergeRecommendations(
  signalDerived: NormalizedRecommendation[],
  curated: NormalizedRecommendation[],
): NormalizedRecommendation[] {
  const curatedCampaignIds = new Set(
    curated
      .filter((r) => r.sourceEntityType === "campaign")
      .map((r) => r.sourceEntityId),
  );

  const filteredSignal = signalDerived.filter((r) => {
    if (r.sourceEntityType !== "campaign") return true;
    return !curatedCampaignIds.has(r.sourceEntityId);
  });

  return [...curated, ...filteredSignal].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );
}

export function buildAllMockRecommendations(
  campaigns: NormalizedCampaignListItem[],
): NormalizedRecommendation[] {
  const signalDerived = buildRecommendationsFromCampaigns(campaigns);
  const curated = mapLegacyCuratedRecommendations();
  return mergeRecommendations(signalDerived, curated);
}

export function computeRecommendationSummary(
  recommendations: NormalizedRecommendation[],
): RecommendationDataSummary {
  const active = recommendations.filter(
    (r) => r.status !== "dismissed" && r.status !== "done_manually",
  );

  return {
    activeCount: active.length,
    urgentCount: active.filter((r) => r.priority === "urgent").length,
    estimatedMonthlySavingsUsd: active.reduce(
      (sum, r) => sum + (r.impactEstimate.monthlySavingsUsd ?? 0),
      0,
    ),
    estimatedRevenueUpliftUsd: active.reduce(
      (sum, r) => sum + (r.impactEstimate.monthlyRevenueUpliftUsd ?? 0),
      0,
    ),
    lastAnalyzedLabel: "2 hours ago",
    lastAnalyzedAt: "2026-05-17T14:00:00.000Z",
  };
}

/** Top N recommendations for Overview preview card */
export function toOverviewRecommendations(
  recommendations: NormalizedRecommendation[],
  limit = 3,
): Recommendation[] {
  return recommendations.slice(0, limit).map((rec) => ({
    id: rec.id,
    priority: rec.priority,
    title: rec.title,
    whyItMatters: rec.summary,
    estimatedImpact: rec.impactEstimate.summary,
    manualActionNote: rec.manualAction.summary,
    impactVariant:
      rec.impactEstimate.variant === "default" ? "warning" : rec.impactEstimate.variant,
    relatedCampaignId: rec.sourceEntityType === "campaign" ? rec.sourceEntityId : undefined,
  }));
}
