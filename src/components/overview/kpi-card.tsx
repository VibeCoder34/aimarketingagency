import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { OverviewKpi } from "@/lib/data/types";
import { cn, formatCurrency, formatNumber, formatPercent, formatPercentagePoints } from "@/lib/utils";
import { overviewCardClass } from "@/components/overview/overview-shell";

function formatValue(value: number, mode: OverviewKpi["valueMode"]) {
  switch (mode) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value, 2);
    case "percent_points":
      return formatPercentagePoints(value, 2);
    case "ratio":
      return `${value.toFixed(2)}x`;
    default:
      return formatNumber(value);
  }
}

function DeltaIcon({ direction }: { direction: OverviewKpi["deltaDirection"] }) {
  if (direction === "up") return <TrendingUp className="h-3.5 w-3.5" />;
  if (direction === "down") return <TrendingDown className="h-3.5 w-3.5" />;
  return <Minus className="h-3.5 w-3.5" />;
}

function deltaTone(direction: OverviewKpi["deltaDirection"], invert = false) {
  if (direction === "neutral") return "text-zinc-500 bg-zinc-100";
  const positive = direction === "up";
  const good = invert ? !positive : positive;
  return good ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50";
}

export function KpiCard({ kpi }: { kpi: OverviewKpi }) {
  const available = kpi.available !== false;
  const sign = kpi.deltaPercent > 0 ? "+" : "";
  const deltaText = `${sign}${kpi.deltaPercent.toFixed(1)}% vs prior period`;

  return (
    <article className={cn(overviewCardClass, "flex flex-col")}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{kpi.label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
          available ? "text-zinc-900" : "text-zinc-400",
        )}
      >
        {available ? formatValue(kpi.value, kpi.valueMode) : "—"}
      </p>
      <span
        className={cn(
          "mt-2 inline-flex w-fit items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
          deltaTone(kpi.deltaDirection, kpi.invertDelta),
        )}
      >
        <DeltaIcon direction={kpi.deltaDirection} />
        {deltaText}
      </span>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        {available ? kpi.interpretation : (kpi.unavailableReason ?? kpi.interpretation)}
      </p>
    </article>
  );
}
