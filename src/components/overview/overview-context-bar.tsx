import { Clock, Database, ShieldCheck } from "lucide-react";
import type { AccountOverviewContext } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function OverviewContextBar({ context }: { context: AccountOverviewContext }) {
  return (
    <header className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Account overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{context.accountName}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {context.dateRangeLabel} · {context.dateRangeDetail}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="muted" className="gap-1.5 px-2.5 py-1">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Read-only mode
            </Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Last synced {context.lastSyncedAgo}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              disabled
              aria-label="Account selector (demo)"
              className="h-9 cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 opacity-80"
              defaultValue="northwind"
            >
              <option value="northwind">Northwind Media</option>
            </select>
            <select
              disabled
              aria-label="Date range (demo)"
              className="h-9 cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 opacity-80"
              defaultValue="may"
            >
              <option value="may">May 1–17, 2026</option>
            </select>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-600">
        <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
        <span>
          <strong className="font-medium text-zinc-800">AdPilot never edits, pauses, publishes, or changes campaigns.</strong>{" "}
          Analyze performance here, then apply any changes manually in Meta Ads Manager.
        </span>
      </p>
    </header>
  );
}
