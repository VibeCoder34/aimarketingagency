import { PlugZap, Unplug } from "lucide-react";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import {
  META_HEALTH_DESCRIPTIONS,
  META_HEALTH_LABELS,
  formatTokenExpiryDate,
  metaHealthBadgeVariant,
} from "@/lib/meta/health-labels";
import { Badge } from "@/components/ui/badge";

type MetaConnectionControlsProps = {
  data: AdAccountsPageData;
  returnTo?: "/ad-accounts" | "/settings";
  compact?: boolean;
};

export function MetaConnectionControls({
  data,
  returnTo = "/ad-accounts",
  compact = false,
}: MetaConnectionControlsProps) {
  const health = data.health;
  const state = health?.state ?? "disconnected";
  const expiryLabel = formatTokenExpiryDate(health?.tokenExpiresAt ?? null);
  const showConnect = data.metaConfigured && data.canConnect;
  const showDisconnect = data.canConnect && state !== "disconnected";
  const connectLabel =
    state === "expired" || state === "expires_soon" || state === "error"
      ? "Reconnect Meta Ads"
      : "Connect Meta Ads";

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={metaHealthBadgeVariant(state)}>{META_HEALTH_LABELS[state]}</Badge>
        {health && health.connectedAccountCount > 0 && (
          <span className="text-sm text-[var(--adpilot-text-muted)]">
            {health.connectedAccountCount} ad account
            {health.connectedAccountCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--adpilot-text-muted)]">{META_HEALTH_DESCRIPTIONS[state]}</p>

      {expiryLabel && state !== "disconnected" && (
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Token expires: <span className="font-medium text-[var(--adpilot-text)]">{expiryLabel}</span>
        </p>
      )}

      {health?.metaBusinessName && state !== "disconnected" && (
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Meta profile:{" "}
          <span className="font-medium text-[var(--adpilot-text)]">{health.metaBusinessName}</span>
        </p>
      )}

      {!data.metaConfigured ? (
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Meta OAuth is not configured on this environment.
        </p>
      ) : !data.canConnect ? (
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Only organization owners and admins can manage the Meta connection.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {showConnect && (
            <a
              href="/api/meta/oauth/start"
              className="inline-flex items-center rounded-[var(--adpilot-radius-item)] bg-[var(--adpilot-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <PlugZap className="mr-2 h-4 w-4" aria-hidden />
              {connectLabel}
            </a>
          )}
          {showDisconnect && (
            <form
              action={`/api/meta/disconnect?return_to=${encodeURIComponent(returnTo)}`}
              method="POST"
            >
              <button
                type="submit"
                className="inline-flex items-center rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)]"
              >
                <Unplug className="mr-2 h-4 w-4" aria-hidden />
                Disconnect
              </button>
            </form>
          )}
        </div>
      )}

      {showConnect && !compact && (
        <p className="text-xs text-[var(--adpilot-text-muted)]">
          Requests <code className="rounded bg-zinc-100 px-1">ads_read</code> only. AdPilot will not edit
          campaigns.
        </p>
      )}
    </div>
  );
}
