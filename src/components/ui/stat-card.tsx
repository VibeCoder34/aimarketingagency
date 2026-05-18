import type { DeltaDirection } from "@/types";
import { cn, formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export type StatCardProps = {
  label: string;
  /** Display string or number (currency mode uses formatCurrency) */
  value: number;
  valueMode?: "currency" | "number" | "ratio" | "percent";
  currency?: string;
  deltaPercent: number;
  deltaDirection: DeltaDirection;
};

function deltaLabel(direction: DeltaDirection, pct: number) {
  const sign = pct > 0 ? "+" : "";
  const text = `${sign}${pct.toFixed(1)}%`;
  if (direction === "neutral") return `${text} vs prior period`;
  return `${text} vs prior period`;
}

export function StatCard({ label, value, valueMode = "currency", currency = "USD", deltaPercent, deltaDirection }: StatCardProps) {
  const formatted =
    valueMode === "currency"
      ? formatCurrency(value, currency)
      : valueMode === "percent"
        ? formatPercent(value, 2)
        : valueMode === "ratio"
          ? `${value.toFixed(2)}x`
          : formatNumber(value);

  const tone =
    deltaDirection === "up"
      ? "text-emerald-700"
      : deltaDirection === "down"
        ? "text-red-700"
        : "text-[var(--adpilot-text-muted)]";

  return (
    <div className="rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--adpilot-text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--adpilot-text-primary)]">{formatted}</p>
      <p className={cn("mt-1 text-xs font-medium", tone)}>{deltaLabel(deltaDirection, deltaPercent)}</p>
    </div>
  );
}
