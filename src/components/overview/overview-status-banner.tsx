import Link from "next/link";
import { AlertCircle, PlugZap } from "lucide-react";
import type { OverviewDisplayMode } from "@/lib/data/types";

export function OverviewStatusBanner({
  displayMode,
  title,
  message,
}: {
  displayMode: OverviewDisplayMode;
  title?: string;
  message?: string;
}) {
  if (displayMode === "full" || displayMode === "demo") {
    return null;
  }

  const showReconnect = displayMode === "reconnect_required";

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <AlertCircle className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-zinc-900">{title ?? "Action needed"}</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">{message}</p>
          {showReconnect ? (
            <a
              href="/api/meta/oauth/start"
              className="mt-3 inline-flex items-center rounded-lg bg-[var(--adpilot-accent)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              <PlugZap className="mr-2 h-4 w-4" aria-hidden />
              Reconnect Meta
            </a>
          ) : displayMode === "select_account" ? (
            <Link
              href="/settings?section=integrations"
              className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline-offset-2 hover:underline"
            >
              Open Settings → Integrations
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
