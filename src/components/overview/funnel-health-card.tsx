import type { OverviewFunnelMetrics, OverviewFunnelStep } from "@/lib/data/types";
import { OverviewCard } from "@/components/overview/overview-shell";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { Filter } from "lucide-react";

function variantLabel(variant: OverviewFunnelMetrics["variant"]): string {
  switch (variant) {
    case "ecommerce":
      return "E-commerce funnel";
    case "lead_gen":
      return "Lead gen funnel";
    case "mixed":
      return "Mixed funnel (all available steps)";
    default:
      return "Funnel (available metrics)";
  }
}

function FunnelStepRow({ step, index }: { step: OverviewFunnelStep; index: number }) {
  const missing = step.missing ?? step.value == null;
  const displayValue = !missing && step.value != null ? formatNumber(step.value) : "—";
  const rate =
    step.rateFromPrevious != null
      ? `${formatPercent(step.rateFromPrevious, 1)} from prior step`
      : missing
        ? "Not returned by Meta"
        : null;

  return (
    <li className="flex items-center gap-3">
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          missing ? "bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white",
        )}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <StepContent label={step.label} displayValue={displayValue} rate={rate} missing={missing} />
      </div>
    </li>
  );
}

function StepContent({
  label,
  displayValue,
  rate,
  missing,
}: {
  label: string;
  displayValue: string;
  rate: string | null;
  missing: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-1">
        <span className="text-sm font-medium text-zinc-800">{label}</span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            missing ? "text-zinc-400" : "text-zinc-900",
          )}
        >
          {displayValue}
        </span>
      </div>
      {rate ? <p className="text-xs text-zinc-500">{rate}</p> : null}
    </>
  );
}

export function FunnelHealthCard({ funnel }: { funnel: OverviewFunnelMetrics }) {
  return (
    <OverviewCard
      title="Funnel health"
      subtitle={variantLabel(funnel.variant)}
      action={<Filter className="h-4 w-4 text-zinc-400" aria-hidden />}
    >
      {funnel.message ? (
        <p className="mb-4 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-900">
          {funnel.message}
        </p>
      ) : null}
      <ol className="space-y-3">
        {funnel.steps.map((step, index) => (
          <FunnelStepRow key={step.id} step={step} index={index} />
        ))}
      </ol>
    </OverviewCard>
  );
}
