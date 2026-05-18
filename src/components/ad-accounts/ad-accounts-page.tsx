"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import { formatDisplayAccountId } from "@/lib/meta/display";
import {
  META_OAUTH_ERROR_MESSAGES,
  type MetaOAuthErrorReason,
} from "@/lib/meta/errors";
import { MetaConnectionControls } from "@/components/meta/meta-connection-controls";
import { PageActions } from "@/components/pages/page-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function statusVariant(status: string | null) {
  if (status === "active" || status === "connected") return "success" as const;
  if (status === "disabled" || status === "closed" || status === "error") return "danger" as const;
  return "muted" as const;
}

export function AdAccountsPage({ data }: { data: AdAccountsPageData }) {
  const searchParams = useSearchParams();
  const metaFlash = searchParams.get("meta");
  const reason = searchParams.get("reason") as MetaOAuthErrorReason | null;

  const banner = useMemo(() => {
    if (metaFlash === "connected") {
      return {
        variant: "success" as const,
        message: "Meta Ads connected successfully.",
      };
    }
    if (metaFlash === "disconnected") {
      return {
        variant: "success" as const,
        message: "Meta Ads disconnected. Read-only access has been removed.",
      };
    }
    if (metaFlash === "error" && reason && META_OAUTH_ERROR_MESSAGES[reason]) {
      return {
        variant: "danger" as const,
        message: META_OAUTH_ERROR_MESSAGES[reason],
      };
    }
    return null;
  }, [metaFlash, reason]);

  const hasAccounts = data.accounts.length > 0;

  return (
    <>
      <PageActions showExport={false} />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--adpilot-text-muted)]">
              {data.organizationName}
            </p>
            <p className="text-sm text-[var(--adpilot-text-muted)]">
              Connect Meta ad accounts for read-only reporting. Changes are applied manually in Meta Ads
              Manager.
            </p>
          </div>
          <Badge variant="muted">Read-only · ads_read only</Badge>
        </div>

        {banner && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              banner.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-900"
            }`}
            role="status"
          >
            {banner.message}
          </div>
        )}

        <Card title="Meta Ads connection">
          <MetaConnectionControls data={data} returnTo="/ad-accounts" />
        </Card>

        <Card title="Connected ad accounts">
          {!hasAccounts ? (
            <p className="text-sm text-[var(--adpilot-text-muted)]">
              No Meta ad accounts connected yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                    <th className="py-2 pr-3 font-medium">Account name</th>
                    <th className="py-2 pr-3 font-medium">Account ID</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 pr-3 font-medium">Currency</th>
                    <th className="py-2 pr-3 font-medium">Timezone</th>
                    <th className="py-2 font-medium">Connection</th>
                  </tr>
                </thead>
                <tbody>
                  {data.accounts.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b border-[var(--adpilot-border)] last:border-0"
                    >
                      <td className="py-3 pr-3 font-medium">{account.meta_ad_account_name}</td>
                      <td className="py-3 pr-3 font-mono text-xs tabular-nums">
                        {formatDisplayAccountId(account.meta_ad_account_id)}
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant={statusVariant(account.account_status)}>
                          {account.account_status ?? "unknown"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">{account.currency ?? "—"}</td>
                      <td className="py-3 pr-3">{account.timezone_name ?? "—"}</td>
                      <td className="py-3">
                        <Badge variant={statusVariant(account.connection_status)}>
                          {account.connection_status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="text-xs text-[var(--adpilot-text-muted)]">
          Dashboard modules still use mock data until Meta sync is enabled.{" "}
          <Link href="/settings" className="text-[var(--adpilot-accent)] hover:underline">
            Settings
          </Link>
          {" · "}
          <Link
            href="/ad-accounts/meta-data-explorer"
            className="text-[var(--adpilot-accent)] hover:underline"
          >
            Meta Data Explorer
          </Link>{" "}
          <span className="text-[var(--adpilot-text-muted)]">(internal read-only dev tool)</span>
        </p>
      </div>
    </>
  );
}
