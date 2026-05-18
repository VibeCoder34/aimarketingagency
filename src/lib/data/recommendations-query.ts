import type {
  NormalizedRecommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationSourceEntityType,
  RecommendationStatus,
} from "@/lib/data/types";

export type RecommendationFilters = {
  priority: RecommendationPriority | "all";
  category: RecommendationCategory | "all";
  status: RecommendationStatus | "all";
  sourceEntityType: RecommendationSourceEntityType | "all";
  search: string;
};

export const DEFAULT_RECOMMENDATION_FILTERS: RecommendationFilters = {
  priority: "all",
  category: "all",
  status: "all",
  sourceEntityType: "all",
  search: "",
};

export function filterRecommendations(
  recommendations: NormalizedRecommendation[],
  filters: RecommendationFilters,
): NormalizedRecommendation[] {
  const q = filters.search.trim().toLowerCase();

  return recommendations.filter((rec) => {
    if (filters.priority !== "all" && rec.priority !== filters.priority) return false;
    if (filters.category !== "all" && rec.category !== filters.category) return false;
    if (filters.status !== "all" && rec.status !== filters.status) return false;
    if (filters.sourceEntityType !== "all" && rec.sourceEntityType !== filters.sourceEntityType) {
      return false;
    }
    if (!q) return true;
    const haystack = [
      rec.title,
      rec.summary,
      rec.explanation,
      rec.sourceEntityName,
      rec.category,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export const RECOMMENDATION_PRIORITY_OPTIONS: { label: string; value: RecommendationPriority | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Urgent", value: "urgent" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export const RECOMMENDATION_CATEGORY_OPTIONS: { label: string; value: RecommendationCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Budget", value: "budget" },
  { label: "Creative", value: "creative" },
  { label: "Audience", value: "audience" },
  { label: "Structure", value: "structure" },
  { label: "Scaling", value: "scaling" },
  { label: "Tracking", value: "tracking" },
];

export const RECOMMENDATION_STATUS_OPTIONS: { label: string; value: RecommendationStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Planned", value: "planned" },
  { label: "Done manually", value: "done_manually" },
  { label: "Dismissed", value: "dismissed" },
];

export const RECOMMENDATION_SOURCE_OPTIONS: {
  label: string;
  value: RecommendationSourceEntityType | "all";
}[] = [
  { label: "All sources", value: "all" },
  { label: "Account", value: "account" },
  { label: "Campaign", value: "campaign" },
  { label: "Ad set", value: "adset" },
  { label: "Ad", value: "ad" },
];

export function getRecommendationCategoryLabel(category: RecommendationCategory): string {
  const labels: Record<RecommendationCategory, string> = {
    budget: "Budget",
    creative: "Creative",
    audience: "Audience",
    structure: "Structure",
    scaling: "Scaling",
    tracking: "Tracking",
  };
  return labels[category];
}

export function getRecommendationStatusLabel(status: RecommendationStatus): string {
  const labels: Record<RecommendationStatus, string> = {
    new: "New",
    reviewed: "Reviewed",
    planned: "Planned",
    done_manually: "Done manually",
    dismissed: "Dismissed",
  };
  return labels[status];
}
