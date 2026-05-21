import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

/** Format a decimal ratio as percent (0.0436 → "4.36%"). For mock/fixture data using ratio CTR. */
export function formatPercent(value: number, fractionDigits = 2) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

/** Format a value already in percentage points (4.36 → "4.36%"). Use for Meta Ads `ctr`. */
export function formatPercentagePoints(value: number, fractionDigits = 2) {
  if (!Number.isFinite(value)) return "—";
  return `${value.toFixed(fractionDigits)}%`;
}
