import Link from "next/link";
import { PlugZap, Unplug } from "lucide-react";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import { getMetaIntegrationStatus } from "@/lib/meta/integration-ui";

type MetaConnectionActionsProps = {
  data: AdAccountsPageData;
  returnTo?: "/settings" | "/ad-accounts";
  showAdvancedLink?: boolean;
};

export function MetaConnectionActions({
  data,
  returnTo = "/settings",
  showAdvancedLink = false,
}: MetaConnectionActionsProps) {
  const status = getMetaIntegrationStatus(data);
  const showConnect =
    data.metaConfigured &&
    data.canConnect &&
    (status === "not_connected" ||
      status === "reconnect_required" ||
      status === "connection_issue" ||
      status === "connected_no_accounts");
  const showReconnect = data.metaConfigured && data.canConnect && status === "connected";
  const showDisconnect = data.canConnect && status !== "not_connected";

  const connectLabel =
    status === "not_connected" ? "Connect Meta Ads" : "Reconnect Meta Ads";

  if (!data.metaConfigured) {
    return (
      <p className="text-sm text-[var(--adpilot-text-muted)]">
        Meta OAuth is not configured in this environment. Contact your administrator.
      </p>
    );
  }

  if (!data.canConnect) {
    return (
      <p className="text-sm text-[var(--adpilot-text-muted)]">
        Ask an admin or owner to manage this integration.
      </p>
    );
  }

  return (
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
      {showReconnect && (
        <a
          href="/api/meta/oauth/start"
          className="inline-flex items-center rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)]"
        >
          <PlugZap className="mr-2 h-4 w-4" aria-hidden />
          Reconnect
        </a>
      )}
      {showDisconnect && (
        <form action={`/api/meta/disconnect?return_to=${encodeURIComponent(returnTo)}`} method="POST">
          <button
            type="submit"
            className="inline-flex items-center rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)]"
          >
            <Unplug className="mr-2 h-4 w-4" aria-hidden />
            Disconnect
          </button>
        </form>
      )}
      {showAdvancedLink && status !== "not_connected" && (
        <div className="flex flex-col gap-1">
          <Link
            href="/ad-accounts/meta-data-explorer"
            className="text-sm text-[var(--adpilot-text-muted)] hover:text-[var(--adpilot-accent)] hover:underline"
          >
            Advanced: Meta Data Explorer
          </Link>
          <Link
            href="/settings/meta-reporting-debug"
            className="text-sm text-[var(--adpilot-text-muted)] hover:text-[var(--adpilot-accent)] hover:underline"
          >
            Internal: Reporting data audit
          </Link>
        </div>
      )}
    </div>
  );
}
