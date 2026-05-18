"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PlugZap } from "lucide-react";
import type { MetaDataExplorerPageData } from "@/lib/meta/explorer-queries";
import {
  META_EXPLORER_OPERATIONS,
  operationRequiresAdAccount,
} from "@/lib/meta/explorer-operations";
import { formatDisplayAccountId } from "@/lib/meta/display";
import {
  META_HEALTH_LABELS,
  formatTokenExpiryDate,
  metaHealthBadgeVariant,
} from "@/lib/meta/health-labels";
import { ExplorerFetchPanel } from "@/components/meta-data-explorer/explorer-fetch-panel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MetaDataExplorerPage({ data }: { data: MetaDataExplorerPageData }) {
  const healthState = data.health?.state ?? "disconnected";
  const needsReconnect =
    healthState === "disconnected" ||
    healthState === "expired" ||
    healthState === "error" ||
    healthState === "expires_soon";

  const [selectedAccountId, setSelectedAccountId] = useState(
    () => data.accounts.find((a) => a.is_selected)?.meta_ad_account_id ?? data.accounts[0]?.meta_ad_account_id ?? "",
  );

  const fetchDisabled = useMemo(
    () => !data.canUseExplorer || needsReconnect || !data.metaConfigured,
    [data.canUseExplorer, needsReconnect, data.metaConfigured],
  );

  const accountRequiredDisabled = fetchDisabled || !selectedAccountId;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--adpilot-text-muted)]">
            Internal · Developer tool
          </p>
          <h1 className="text-xl font-semibold">Meta Data Explorer</h1>
          <p className="mt-1 max-w-2xl text-sm text-amber-900">
            Read-only developer tool. This page only fetches Meta Ads data. It does not modify
            campaigns.
          </p>
        </div>
        <Badge variant="muted">ads_read · insights: maximum</Badge>
      </div>

      <Card title="Connection">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={metaHealthBadgeVariant(healthState)}>
            {META_HEALTH_LABELS[healthState]}
          </Badge>
          {data.health?.tokenExpiresAt && (
            <span className="text-sm text-[var(--adpilot-text-muted)]">
              Token expires: {formatTokenExpiryDate(data.health.tokenExpiresAt)}
            </span>
          )}
        </div>

        {needsReconnect && data.canUseExplorer && data.metaConfigured && (
          <div className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <p>Meta connection needs attention before fetches will work.</p>
            <a
              href="/api/meta/oauth/start"
              className="mt-2 inline-flex items-center text-sm font-medium text-[var(--adpilot-accent)] hover:underline"
            >
              <PlugZap className="mr-1 h-4 w-4" aria-hidden />
              Reconnect Meta Ads
            </a>
          </div>
        )}

        {!data.canUseExplorer && (
          <p className="mt-3 text-sm text-[var(--adpilot-text-muted)]">
            Only organization owners and admins can run Meta Data Explorer fetches.
          </p>
        )}
      </Card>

      <Card title="Ad account">
        {data.accounts.length === 0 ? (
          <p className="text-sm text-[var(--adpilot-text-muted)]">
            No connected Meta ad accounts found.{" "}
            <Link
              href="/settings?section=integrations"
              className="text-[var(--adpilot-accent)] hover:underline"
            >
              Connect Meta Ads in Settings
            </Link>
            .
          </p>
        ) : (
          <label className="block max-w-md text-sm">
            <span className="mb-1 block text-[var(--adpilot-text-muted)]">Selected ad account</span>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              disabled={!data.canUseExplorer}
              className="w-full rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-white px-3 py-2"
            >
              {data.accounts.map((account) => (
                <option key={account.id} value={account.meta_ad_account_id}>
                  {account.meta_ad_account_name} (
                  {formatDisplayAccountId(account.meta_ad_account_id)})
                </option>
              ))}
            </select>
          </label>
        )}
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--adpilot-text-muted)]">
            Read-only API probes
          </h2>
          <p className="mt-2 text-sm text-[var(--adpilot-text-muted)]">
            Explorer uses Meta&apos;s maximum available date preset by default so older ad accounts
            can return historical data.
          </p>
        </div>
        {META_EXPLORER_OPERATIONS.map((operation) => (
          <ExplorerFetchPanel
            key={operation}
            operation={operation}
            adAccountId={selectedAccountId}
            disabled={
              operationRequiresAdAccount(operation) ? accountRequiredDisabled : fetchDisabled
            }
            hint={
              operation === "daily_insights"
                ? "Daily maximum data can be large. Results may be truncated by the 5-page explorer limit."
                : undefined
            }
          />
        ))}
      </div>

      <p className="text-xs text-[var(--adpilot-text-muted)]">
        Dashboard modules still use mock data.{" "}
        <Link
          href="/settings?section=integrations"
          className="text-[var(--adpilot-accent)] hover:underline"
        >
          Back to Integrations
        </Link>
      </p>
    </div>
  );
}
