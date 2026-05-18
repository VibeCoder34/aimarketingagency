import type { AdAccountsPageData } from "@/lib/meta/queries";
import {
  getMetaIntegrationStatus,
  integrationStatusBadgeVariant,
  META_INTEGRATION_STATUS_LABELS,
} from "@/lib/meta/integration-ui";
import { formatTokenExpiryDate } from "@/lib/meta/health-labels";
import { MetaConnectionActions } from "@/components/meta/meta-connection-actions";
import { Badge } from "@/components/ui/badge";

type MetaConnectionControlsProps = {
  data: AdAccountsPageData;
  returnTo?: "/settings" | "/ad-accounts";
  compact?: boolean;
};

/** @deprecated Use MetaIntegrationCard for product surfaces */
export function MetaConnectionControls({
  data,
  returnTo = "/settings",
  compact = false,
}: MetaConnectionControlsProps) {
  const status = getMetaIntegrationStatus(data);
  const expiryLabel = formatTokenExpiryDate(data.health?.tokenExpiresAt ?? null);

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={integrationStatusBadgeVariant(status)}>
          {META_INTEGRATION_STATUS_LABELS[status]}
        </Badge>
        {data.health && data.health.connectedAccountCount > 0 && (
          <span className="text-sm text-[var(--adpilot-text-muted)]">
            {data.health.connectedAccountCount} ad account
            {data.health.connectedAccountCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {data.health?.metaBusinessName && status !== "not_connected" && (
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Meta profile:{" "}
          <span className="font-medium text-[var(--adpilot-text)]">{data.health.metaBusinessName}</span>
        </p>
      )}

      {expiryLabel && status !== "not_connected" && (
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Token expires: <span className="font-medium text-[var(--adpilot-text)]">{expiryLabel}</span>
        </p>
      )}

      <MetaConnectionActions data={data} returnTo={returnTo} />
    </div>
  );
}
