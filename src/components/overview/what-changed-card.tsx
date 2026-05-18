import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DeltaDirection, WhatChangedItem } from "@/lib/data/types";
import { OverviewCard } from "@/components/overview/overview-shell";
import { cn } from "@/lib/utils";

function DirectionIcon({ direction }: { direction: DeltaDirection }) {
  if (direction === "up") return <TrendingUp className="h-4 w-4 text-emerald-600" />;
  if (direction === "down") return <TrendingDown className="h-4 w-4 text-red-600" />;
  return <Minus className="h-4 w-4 text-zinc-400" />;
}

function deltaLabel(row: WhatChangedItem) {
  const sign = row.deltaPercent > 0 ? "+" : "";
  if (row.deltaDirection === "neutral") return "Flat";
  return `${sign}${row.deltaPercent.toFixed(1)}%`;
}

export function WhatChangedCard({ rows }: { rows: WhatChangedItem[] }) {
  return (
    <OverviewCard title="What changed" subtitle="Compared to the previous period">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2.5"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <DirectionIcon direction={row.deltaDirection} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-zinc-900">{row.label}</span>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    row.deltaDirection === "up" && "text-emerald-700",
                    row.deltaDirection === "down" && "text-red-700",
                    row.deltaDirection === "neutral" && "text-zinc-500",
                  )}
                >
                  {deltaLabel(row)}
                </span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{row.explanation}</p>
            </div>
          </li>
        ))}
      </ul>
    </OverviewCard>
  );
}
