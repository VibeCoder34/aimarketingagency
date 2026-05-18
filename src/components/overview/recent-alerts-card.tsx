import Link from "next/link";
import type { Alert } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { OverviewCard } from "@/components/overview/overview-shell";

const SEVERITY_VARIANT: Record<Alert["severity"], "danger" | "warning" | "default" | "muted"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "muted",
};

export function RecentAlertsCard({ alerts }: { alerts: Alert[] }) {
  return (
    <OverviewCard title="Recent alerts" subtitle="Mock monitoring signals">
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li key={alert.id} className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <Badge variant={SEVERITY_VARIANT[alert.severity]} className="shrink-0 capitalize">
                {alert.severity}
              </Badge>
              <span className="text-[10px] text-zinc-400">{alert.timeAgo}</span>
            </div>
            <p className="mt-1.5 text-sm font-medium text-zinc-900">{alert.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{alert.description}</p>
          </li>
        ))}
      </ul>
      <Link
        href="/alerts"
        className="mt-4 inline-flex text-xs font-medium text-[#1877f2] hover:underline"
      >
        View alerts →
      </Link>
    </OverviewCard>
  );
}
