import { AlertTriangle, Gauge } from "lucide-react";
import type { AccountHealth } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { overviewCardClass } from "@/components/overview/overview-shell";
import { cn } from "@/lib/utils";

export function AccountHealthCard({ health }: { health: AccountHealth }) {
  const isAttention = health.status === "needs_attention";

  return (
    <section
      className={cn(
        overviewCardClass,
        "border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-white",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            isAttention ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
          )}
        >
          {isAttention ? <AlertTriangle className="h-5 w-5" /> : <Gauge className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Account health</p>
          <h2 className="mt-0.5 text-lg font-semibold text-zinc-900">{health.statusLabel}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">{health.explanation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {health.chips.map((chip) => (
              <Badge key={chip.label} variant={chip.variant === "default" ? "default" : chip.variant}>
                {chip.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
