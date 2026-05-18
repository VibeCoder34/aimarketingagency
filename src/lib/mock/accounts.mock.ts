import type { Account } from "@/types";

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "act-1001",
    name: "Nike EMEA",
    adAccountId: "act_482910384712",
    status: "active",
    monthlyBudget: 185_000,
    currentSpend: 142_380,
    currency: "USD",
  },
  {
    id: "act-1002",
    name: "Zalando DE",
    adAccountId: "act_772019384102",
    status: "active",
    monthlyBudget: 128_500,
    currentSpend: 96_240,
    currency: "EUR",
  },
  {
    id: "act-1003",
    name: "Bosch B2B",
    adAccountId: "act_991023847112",
    status: "paused",
    monthlyBudget: 72_000,
    currentSpend: 18_900,
    currency: "USD",
  },
];
