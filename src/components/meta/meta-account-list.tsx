import type { ConnectedMetaAdAccountRow } from "@/lib/meta/queries";
import { formatDisplayAccountId } from "@/lib/meta/display";
import { Badge } from "@/components/ui/badge";

function accountStatusVariant(status: string | null) {
  if (status === "active" || status === "connected") return "success" as const;
  if (status === "disabled" || status === "closed" || status === "error") return "danger" as const;
  return "muted" as const;
}

type MetaAccountListProps = {
  accounts: ConnectedMetaAdAccountRow[];
  compact?: boolean;
};

export function MetaAccountList({ accounts, compact = false }: MetaAccountListProps) {
  if (accounts.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <ul className="space-y-2 text-sm">
        {accounts.map((account) => (
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
            <AccountBadges account={account} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
            <th className="py-2 pr-3 font-medium">Account name</th>
            <th className="py-2 pr-3 font-medium">Account ID</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 font-medium">Default</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id} className="border-b border-[var(--adpilot-border)] last:border-0">
              <td className="py-3 pr-3 font-medium">{account.meta_ad_account_name}</td>
              <td className="py-3 pr-3 font-mono text-xs tabular-nums">
                {formatDisplayAccountId(account.meta_ad_account_id)}
              </td>
              <td className="py-3 pr-3">
                <Badge variant={accountStatusVariant(account.account_status)}>
                  {account.account_status ?? "unknown"}
                </Badge>
              </td>
              <td className="py-3">
                <AccountBadges account={account} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountBadges({ account }: { account: ConnectedMetaAdAccountRow }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {account.is_selected && <Badge variant="success">Default</Badge>}
      {/* TODO: account switching UI — expose default selection when product mode supports it */}
    </div>
  );
}
