import { Gauge } from "lucide-react";
import type { BudgetPacing } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { OverviewCard } from "@/components/overview/overview-shell";
import { formatCurrency } from "@/lib/utils";

function statusVariant(status: BudgetPacing["status"]) {
  if (status === "on_track") return "success" as const;
  if (status === "overpacing") return "danger" as const;
  return "warning" as const;
}

function progressColor(status: BudgetPacing["status"]) {
  if (status === "on_track") return "bg-emerald-600";
  if (status === "overpacing") return "bg-red-600";
  return "bg-amber-500";
}

export function BudgetPacingCard({ pacing }: { pacing: BudgetPacing }) {
  const overProjected = pacing.projectedMonthEndSpend > pacing.total;

  return (
    <OverviewCard title="Budget pacing" subtitle="Monthly cap · read-only projection">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Gauge className="h-4 w-4" />
          </span>
          <Badge variant={statusVariant(pacing.status)}>{pacing.statusLabel}</Badge>
        </div>
      </div>

      <p className="mt-4 text-sm text-zinc-700">
        <span className="font-semibold text-zinc-900">{formatCurrency(pacing.spent)}</span> of{" "}
        <span className="font-semibold text-zinc-900">{formatCurrency(pacing.total)}</span> used ({pacing.percent}%)
      </p>

      <Progress
        value={pacing.percent}
        className="mt-3"
        indicatorClassName={progressColor(pacing.status)}
      />

      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
          <dt className="text-zinc-500">Days remaining</dt>
          <dd className="mt-0.5 font-semibold text-zinc-900">{pacing.daysRemaining}</dd>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2">
          <dt className="text-zinc-500">Projected month-end</dt>
          <dd className={`mt-0.5 font-semibold tabular-nums ${overProjected ? "text-amber-800" : "text-zinc-900"}`}>
            {formatCurrency(pacing.projectedMonthEndSpend)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs leading-relaxed text-zinc-500">
        Projection assumes current daily run rate ({pacing.daysElapsed} of {pacing.daysTotal} days elapsed). Adjust
        budgets manually in Meta if pacing shifts.
      </p>
    </OverviewCard>
  );
}
