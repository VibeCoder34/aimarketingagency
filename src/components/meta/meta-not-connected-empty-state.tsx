import Link from "next/link";
import { PlugZap } from "lucide-react";

type MetaNotConnectedEmptyStateProps = {
  title?: string;
  showSettingsLink?: boolean;
};

export function MetaNotConnectedEmptyState({
  title = "Connect Meta Ads to start analyzing campaigns",
  showSettingsLink = true,
}: MetaNotConnectedEmptyStateProps) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[var(--adpilot-radius-card)] border border-dashed border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-8 text-center">
      <h2 className="max-w-lg text-lg font-semibold text-[var(--adpilot-text-primary)]">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--adpilot-text-muted)]">
        AdPilot uses read-only access to pull campaigns, insights, and performance data. You stay in
        control — recommendations are applied manually in Meta Ads Manager.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/api/meta/oauth/start"
          className="inline-flex items-center rounded-[var(--adpilot-radius-item)] bg-[var(--adpilot-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          <PlugZap className="mr-2 h-4 w-4" aria-hidden />
          Connect Meta Ads
        </a>
        {showSettingsLink && (
          <Link
            href="/settings?section=integrations"
            className="inline-flex items-center rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)]"
          >
            Open Settings
          </Link>
        )}
      </div>
    </div>
  );
}
