/**
 * Normalizes Meta Ads Insights `actions`, `action_values`, and `cost_per_action_type` arrays.
 * Meta uses many action_type aliases; we match the most common variants per outcome.
 */

export type MetaInsightActionEntry = {
  action_type: string;
  value?: string;
};

/** Action types grouped by normalized outcome key */
const ACTION_TYPE_ALIASES: Record<string, readonly string[]> = {
  purchase: [
    "purchase",
    "omni_purchase",
    "offsite_conversion.fb_pixel_purchase",
    "onsite_conversion.purchase",
    "web_in_store_purchase",
  ],
  lead: [
    "lead",
    "onsite_conversion.lead_grouped",
    "offsite_conversion.fb_pixel_lead",
    "leadgen_grouped",
  ],
  complete_registration: [
    "complete_registration",
    "offsite_conversion.fb_pixel_complete_registration",
    "onsite_conversion.complete_registration",
  ],
  add_to_cart: [
    "add_to_cart",
    "offsite_conversion.fb_pixel_add_to_cart",
    "onsite_conversion.add_to_cart",
  ],
  initiate_checkout: [
    "initiate_checkout",
    "offsite_conversion.fb_pixel_initiate_checkout",
    "onsite_conversion.initiate_checkout",
  ],
  view_content: [
    "view_content",
    "offsite_conversion.fb_pixel_view_content",
    "onsite_conversion.view_content",
  ],
  landing_page_view: ["landing_page_view", "omni_landing_page_view"],
  link_click: ["link_click", "outbound_click"],
};

function parseActionValue(value: string | undefined): number {
  if (value == null || value === "") return 0;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function matchesAlias(actionType: string, aliases: readonly string[]): boolean {
  const normalized = actionType.toLowerCase();
  return aliases.some(
    (alias) => normalized === alias || normalized.endsWith(`.${alias}`) || normalized.includes(alias),
  );
}

/** Sums all matching action_type rows for a normalized outcome. */
export function extractActionCount(
  actions: MetaInsightActionEntry[] | undefined,
  outcomeKey: keyof typeof ACTION_TYPE_ALIASES,
): number | null {
  if (!actions?.length) return null;
  const aliases = ACTION_TYPE_ALIASES[outcomeKey];
  let total = 0;
  let matched = false;
  for (const entry of actions) {
    if (!entry.action_type || !matchesAlias(entry.action_type, aliases)) continue;
    total += parseActionValue(entry.value);
    matched = true;
  }
  return matched ? total : null;
}

/** Sums action_values for purchase / conversion value aliases. */
export function extractActionValueSum(
  actionValues: MetaInsightActionEntry[] | undefined,
  outcomeKey: "purchase" | "lead",
): number | null {
  if (!actionValues?.length) return null;
  const aliases = ACTION_TYPE_ALIASES[outcomeKey];
  let total = 0;
  let matched = false;
  for (const entry of actionValues) {
    if (!entry.action_type || !matchesAlias(entry.action_type, aliases)) continue;
    total += parseActionValue(entry.value);
    matched = true;
  }
  return matched ? total : null;
}

export function extractCostPerAction(
  costPerActionType: MetaInsightActionEntry[] | undefined,
  outcomeKey: keyof typeof ACTION_TYPE_ALIASES,
): number | null {
  if (!costPerActionType?.length) return null;
  const aliases = ACTION_TYPE_ALIASES[outcomeKey];
  for (const entry of costPerActionType) {
    if (!entry.action_type || !matchesAlias(entry.action_type, aliases)) continue;
    const n = parseActionValue(entry.value);
    if (n > 0) return n;
  }
  return null;
}

/** Meta returns purchase_roas / website_purchase_roas as action arrays with `value` = ROAS ratio. */
export function extractRoasFromActionArray(
  roasArray: MetaInsightActionEntry[] | undefined,
  preferTypes: readonly string[] = ["omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase"],
): number | null {
  if (!roasArray?.length) return null;

  for (const preferred of preferTypes) {
    const row = roasArray.find((e) => e.action_type?.toLowerCase() === preferred.toLowerCase());
    if (row) {
      const n = parseActionValue(row.value);
      if (n > 0) return n;
    }
  }

  let best = 0;
  let found = false;
  for (const entry of roasArray) {
    const n = parseActionValue(entry.value);
    if (n > 0) {
      best = Math.max(best, n);
      found = true;
    }
  }
  return found ? best : null;
}

export type NormalizedMetaActions = {
  purchase: number | null;
  lead: number | null;
  completeRegistration: number | null;
  addToCart: number | null;
  initiateCheckout: number | null;
  viewContent: number | null;
  landingPageView: number | null;
  linkClick: number | null;
};

export type NormalizedMetaActionValues = {
  purchaseValue: number | null;
  leadValue: number | null;
  purchaseRoas: number | null;
  websitePurchaseRoas: number | null;
  costPerPurchase: number | null;
  costPerLead: number | null;
  costPerAddToCart: number | null;
  costPerInitiateCheckout: number | null;
};

export function normalizeMetaActions(
  actions: MetaInsightActionEntry[] | undefined,
): NormalizedMetaActions {
  return {
    purchase: extractActionCount(actions, "purchase"),
    lead: extractActionCount(actions, "lead"),
    completeRegistration: extractActionCount(actions, "complete_registration"),
    addToCart: extractActionCount(actions, "add_to_cart"),
    initiateCheckout: extractActionCount(actions, "initiate_checkout"),
    viewContent: extractActionCount(actions, "view_content"),
    landingPageView: extractActionCount(actions, "landing_page_view"),
    linkClick: extractActionCount(actions, "link_click"),
  };
}

export function normalizeMetaActionValues(input: {
  actionValues?: MetaInsightActionEntry[];
  purchaseRoas?: MetaInsightActionEntry[];
  websitePurchaseRoas?: MetaInsightActionEntry[];
  costPerActionType?: MetaInsightActionEntry[];
}): NormalizedMetaActionValues {
  return {
    purchaseValue: extractActionValueSum(input.actionValues, "purchase"),
    leadValue: extractActionValueSum(input.actionValues, "lead"),
    purchaseRoas: extractRoasFromActionArray(input.purchaseRoas),
    websitePurchaseRoas: extractRoasFromActionArray(input.websitePurchaseRoas),
    costPerPurchase: extractCostPerAction(input.costPerActionType, "purchase"),
    costPerLead: extractCostPerAction(input.costPerActionType, "lead"),
    costPerAddToCart: extractCostPerAction(input.costPerActionType, "add_to_cart"),
    costPerInitiateCheckout: extractCostPerAction(input.costPerActionType, "initiate_checkout"),
  };
}

export type MetaResultType = "purchase" | "lead" | "complete_registration" | "add_to_cart" | "none";

const RESULT_TYPE_LABELS: Record<Exclude<MetaResultType, "none">, string> = {
  purchase: "Purchases",
  lead: "Leads",
  complete_registration: "Registrations",
  add_to_cart: "Add to cart",
};

/** Picks the primary result metric for account-level performance (purchases > leads > registration > add to cart). */
export function resolvePrimaryResultType(actions: NormalizedMetaActions): {
  resultType: MetaResultType;
  resultTypeLabel: string | null;
  results: number | null;
} {
  const candidates: { type: Exclude<MetaResultType, "none">; count: number | null }[] = [
    { type: "purchase", count: actions.purchase },
    { type: "lead", count: actions.lead },
    { type: "complete_registration", count: actions.completeRegistration },
    { type: "add_to_cart", count: actions.addToCart },
  ];

  for (const { type, count } of candidates) {
    if (count != null && count > 0) {
      return {
        resultType: type,
        resultTypeLabel: RESULT_TYPE_LABELS[type],
        results: count,
      };
    }
  }

  for (const { type, count } of candidates) {
    if (count != null) {
      return {
        resultType: type,
        resultTypeLabel: RESULT_TYPE_LABELS[type],
        results: count,
      };
    }
  }

  return { resultType: "none", resultTypeLabel: null, results: null };
}

export function hasAnyConversionSignal(
  actions: NormalizedMetaActions,
  values: NormalizedMetaActionValues,
): boolean {
  const actionCounts = [
    actions.purchase,
    actions.lead,
    actions.completeRegistration,
    actions.addToCart,
    actions.initiateCheckout,
    actions.viewContent,
    actions.landingPageView,
  ];
  if (actionCounts.some((v) => v != null && v > 0)) return true;
  if (values.purchaseValue != null && values.purchaseValue > 0) return true;
  if (values.purchaseRoas != null && values.purchaseRoas > 0) return true;
  if (values.websitePurchaseRoas != null && values.websitePurchaseRoas > 0) return true;
  return false;
}

export const CONVERSION_DATA_MISSING_MESSAGE =
  "Conversion events were not returned for this account/range. This may mean the Pixel/CAPI is not configured, there were no attributed conversions, or permissions/fields are missing.";
