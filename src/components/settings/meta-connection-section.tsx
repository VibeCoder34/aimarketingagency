import Link from "next/link";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import { formatDisplayAccountId } from "@/lib/meta/display";
import { MetaConnectionControls } from "@/components/meta/meta-connection-controls";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MetaConnectionSection({ data }: { data: AdAccountsPageData }) {
  const hasAccounts = data.accounts.length > 0;

  return (
    <Card title="Meta Connection">
      <p className="text-sm text-[var(--adpilot-text-muted)]">
        Read-only connection using <code className="rounded bg-zinc-100 px-1">ads_read</code> only. AdPilot
        does not change campaigns — apply updates manually in Meta Ads Manager.
      </p>

      <div className="mt-4">
        <MetaConnectionControls data={data} returnTo="/settings" compact />
      </div>

      {hasAccounts && (
        <ul className="mt-4 space-y-2 text-sm">
          {data.accounts.slice(0, 5).map((account) => (
            <li
              key={account.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--adpilot-border)] p-2"
            >
              <span>
                {account.meta_ad_account_name}{" "}
                <span className="text-xs text-[var(--adpilot-text-muted)]">
                  ({formatDisplayAccountId(account.meta_ad_account_id)})
                </span>
              </span>
              <Badge variant={account.connection_status === "connected" ? "success" : "muted"}>
                {account.account_status ?? account.connection_status}
              </Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Link
          href="/ad-accounts"
          className="inline-flex items-center rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)]"
        >
          Manage ad accounts
        </Link>
      </div>
    </Card>
  );
}
