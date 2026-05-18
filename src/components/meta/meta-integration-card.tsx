import type { AdAccountsPageData } from "@/lib/meta/queries";
import {
  getMetaIntegrationStatus,
  integrationStatusBadgeVariant,
  META_INTEGRATION_STATUS_LABELS,
} from "@/lib/meta/integration-ui";
import { formatTokenExpiryDate } from "@/lib/meta/health-labels";
import { MetaConnectionActions } from "@/components/meta/meta-connection-actions";
import { MetaAccountList } from "@/components/meta/meta-account-list";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INTEGRATION_MESSAGES: Record<
  ReturnType<typeof getMetaIntegrationStatus>,
  string
> = {
  not_connected:
    "Connect your Meta Ads account to import campaigns, ad accounts, and performance insights.",
  connected:
    "Meta Ads is connected with read-only access. AdPilot does not change campaigns — apply recommendations manually in Meta Ads Manager.",
  connected_no_accounts:
    "Meta was connected, but no ad accounts were found. Reconnect or check that your Meta user has access to the right Business Manager and ad accounts.",
  reconnect_required: "Your Meta connection needs to be refreshed to keep read-only access.",
  connection_issue:
    "There is a problem with your Meta connection. Try reconnecting, or ask an admin to review permissions.",
};

type MetaIntegrationCardProps = {
  data: AdAccountsPageData;
  returnTo?: "/settings" | "/ad-accounts";
};

export function MetaIntegrationCard({ data, returnTo = "/settings" }: MetaIntegrationCardProps) {
  const status = getMetaIntegrationStatus(data);
  const accountCount = data.accounts.length;
  const expiryLabel = formatTokenExpiryDate(data.health?.tokenExpiresAt ?? null);

  return (
    <Card title="Meta Ads">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={integrationStatusBadgeVariant(status)}>
            {META_INTEGRATION_STATUS_LABELS[status]}
          </Badge>
          {status === "connected" && accountCount > 0 && (
            <span className="text-sm text-[var(--adpilot-text-muted)]">
              {accountCount} ad account{accountCount === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <p className="text-sm text-[var(--adpilot-text-muted)]">{INTEGRATION_MESSAGES[status]}</p>

        <p className="text-xs text-[var(--adpilot-text-muted)]">
          AdPilot requests read-only access and does not publish or edit campaigns in Meta.
        </p>

        {data.health?.metaBusinessName && status !== "not_connected" && (
          <p className="text-sm text-[var(--adpilot-text-muted)]">
            Business Manager:{" "}
            <span className="font-medium text-[var(--adpilot-text)]">
              {data.health.metaBusinessName}
            </span>
          </p>
        )}

        {expiryLabel && status !== "not_connected" && (
          <p className="text-sm text-[var(--adpilot-text-muted)]">
            Connection refreshes by:{" "}
            <span className="font-medium text-[var(--adpilot-text)]">{expiryLabel}</span>
          </p>
        )}

        <MetaConnectionActions data={data} returnTo={returnTo} showAdvancedLink />

        {accountCount > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Connected ad accounts</h3>
            <MetaAccountList accounts={data.accounts} />
          </div>
        )}
      </div>
    </Card>
  );
}
