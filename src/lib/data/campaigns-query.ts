import { isNeedsAttentionSignal } from "@/lib/data/campaign-signals";
import type {
  NormalizedCampaignListItem,
  NormalizedCampaignObjective,
  NormalizedCampaignStatus,
} from "@/lib/data/types";

export type CampaignStatusFilter = "all" | NormalizedCampaignStatus;
export type CampaignObjectiveFilter = "all" | NormalizedCampaignObjective;

export type CampaignSortKey =
  | "highest_spend"
  | "lowest_roas"
  | "highest_cpa"
  | "highest_roas";

export type CampaignListFilters = {
  status: CampaignStatusFilter;
  objective: CampaignObjectiveFilter;
  needsAttentionOnly: boolean;
  search: string;
  sortBy: CampaignSortKey;
};

export const DEFAULT_CAMPAIGN_FILTERS: CampaignListFilters = {
  status: "all",
  objective: "all",
  needsAttentionOnly: false,
  search: "",
  sortBy: "highest_roas",
};

function cpaSortValue(cpa: number | null | undefined, mode: "highest" | "lowest"): number {
  if (cpa == null) return mode === "highest" ? -1 : Number.POSITIVE_INFINITY;
  return cpa;
}

export function filterAndSortCampaigns(
  campaigns: NormalizedCampaignListItem[],
  filters: CampaignListFilters,
): NormalizedCampaignListItem[] {
  let rows = [...campaigns];

  if (filters.status !== "all") {
    rows = rows.filter((c) => c.status === filters.status);
  }

  if (filters.objective !== "all") {
    rows = rows.filter((c) => c.objective === filters.objective);
  }

  if (filters.needsAttentionOnly) {
    rows = rows.filter((c) => isNeedsAttentionSignal(c.signal));
  }

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    rows = rows.filter((c) => c.name.toLowerCase().includes(q));
  }

  const sorters: Record<CampaignSortKey, (a: NormalizedCampaignListItem, b: NormalizedCampaignListItem) => number> = {
    highest_spend: (a, b) => b.spend - a.spend,
    lowest_roas: (a, b) => a.roas - b.roas,
    highest_cpa: (a, b) => cpaSortValue(b.cpa, "highest") - cpaSortValue(a.cpa, "highest"),
    highest_roas: (a, b) => b.roas - a.roas,
  };

  rows.sort(sorters[filters.sortBy]);
  return rows;
}
