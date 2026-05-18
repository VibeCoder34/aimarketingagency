import { CheckCircle2, AlertCircle, XCircle, Eye } from "lucide-react";
import type { DataCoverageScore, DataCoverageStatus } from "@/lib/data/types";
import { OverviewCard } from "@/components/overview/overview-shell";
import { cn } from "@/lib/utils";

function StatusIcon({ status }: { status: DataCoverageStatus }) {
  if (status === "available") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "partial" || status === "limited") return <AlertCircle className="h-4 w-4 text-amber-600" />;
  return <XCircle className="h-4 w-4 text-zinc-400" />;
}

function statusLabel(status: DataCoverageStatus) {
  const map: Record<DataCoverageStatus, string> = {
    available: "Available",
    partial: "Partial",
    missing: "Missing",
    limited: "Limited",
  };
  return map[status];
}

export function DataCoverageCard({ items }: { items: DataCoverageScore[] }) {
  return (
    <OverviewCard
      title="Data coverage"
      subtitle="What you can trust in this account"
      action={<Eye className="h-4 w-4 text-zinc-400" aria-hidden />}
    >
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 text-sm">
            <StatusIcon status={item.status} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="font-medium text-zinc-800">{item.label}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    item.status === "available" && "text-emerald-700",
                    (item.status === "partial" || item.status === "limited") && "text-amber-700",
                    item.status === "missing" && "text-zinc-500",
                  )}
                >
                  {statusLabel(item.status)}
                </span>
              </div>
              {item.note ? <p className="text-xs text-zinc-500">{item.note}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </OverviewCard>
  );
}
