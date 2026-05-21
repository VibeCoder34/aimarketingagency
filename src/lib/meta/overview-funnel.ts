import type { MetaOverviewMetrics } from "@/lib/meta/overview-metrics";
import type { OverviewFunnelMetrics, OverviewFunnelStep } from "@/lib/data/types";

function rateFromPrevious(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous <= 0) return null;
  return (current / previous) * 100;
}

function step(
  id: string,
  label: string,
  value: number | null,
  previousValue: number | null,
): OverviewFunnelStep {
  return {
    id,
    label,
    value,
    rateFromPrevious: rateFromPrevious(value, previousValue),
    missing: value == null,
  };
}

export type FunnelVariant = OverviewFunnelMetrics["variant"];

export function inferFunnelVariant(metrics: MetaOverviewMetrics): FunnelVariant {
  if ((metrics.purchases ?? 0) > 0 || (metrics.addToCart ?? 0) > 0 || (metrics.initiateCheckout ?? 0) > 0) {
    return "ecommerce";
  }
  if ((metrics.leads ?? 0) > 0) {
    return "lead_gen";
  }
  if (metrics.hasConversionData) {
    return "mixed";
  }
  return "unknown";
}

export function buildOverviewFunnelMetrics(metrics: MetaOverviewMetrics): OverviewFunnelMetrics {
  const variant = inferFunnelVariant(metrics);
  const impressions = metrics.impressions > 0 ? metrics.impressions : null;
  const clicks = metrics.clicks > 0 ? metrics.clicks : metrics.linkClicks;
  const landing = metrics.landingPageViews;
  const viewContent = metrics.viewContent;
  const addToCart = metrics.addToCart;
  const checkout = metrics.initiateCheckout;
  const purchases = metrics.purchases;
  const leads = metrics.leads;

  let steps: OverviewFunnelStep[];

  if (variant === "ecommerce") {
    steps = [
      step("impressions", "Impressions", impressions, null),
      step("clicks", "Clicks", clicks, impressions),
      step("landing_page_views", "Landing page views", landing, clicks),
      step("view_content", "View content", viewContent, landing ?? clicks),
      step("add_to_cart", "Add to cart", addToCart, viewContent ?? landing ?? clicks),
      step("initiate_checkout", "Initiate checkout", checkout, addToCart ?? viewContent),
      step("purchases", "Purchases", purchases, checkout ?? addToCart),
    ];
  } else if (variant === "lead_gen") {
    steps = [
      step("impressions", "Impressions", impressions, null),
      step("clicks", "Clicks", clicks, impressions),
      step("landing_page_views", "Landing page views", landing, clicks),
      step("leads", "Leads", leads, landing ?? clicks),
    ];
  } else {
    steps = [
      step("impressions", "Impressions", impressions, null),
      step("clicks", "Clicks", clicks, impressions),
      step("landing_page_views", "Landing page views", landing, clicks),
      step("view_content", "View content", viewContent, landing ?? clicks),
      step("add_to_cart", "Add to cart", addToCart, viewContent ?? clicks),
      step("leads", "Leads", leads, clicks),
      step("purchases", "Purchases", purchases, addToCart ?? clicks),
    ];
  }

  const hasAnyStepData = steps.some((s) => s.value != null && s.value > 0);
  let message: string | undefined;

  if (!metrics.hasConversionData) {
    message =
      "Funnel conversion steps need Pixel/CAPI events. Traffic steps (impressions, clicks) may still show.";
  } else if (variant === "unknown" || variant === "mixed") {
    message =
      "Account objective is unclear — showing all available funnel metrics. Missing steps are marked.";
  }

  if (!hasAnyStepData && metrics.impressions === 0) {
    message = "No delivery in this period — funnel metrics are empty.";
  }

  return { variant, steps, message };
}
