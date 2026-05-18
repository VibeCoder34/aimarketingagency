import { ChevronDown } from "lucide-react";

export type AccountSelectorProps = {
  agencyName: string;
};

export function AccountSelector({ agencyName }: AccountSelectorProps) {
  return (
    <button
      type="button"
      className="flex h-9 max-w-[220px] items-center gap-2 rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-3 text-left text-sm font-medium text-[var(--adpilot-text-primary)] transition-colors duration-150 hover:bg-[var(--adpilot-nav-active-bg)]"
    >
      <span className="truncate">{agencyName}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--adpilot-text-muted)]" aria-hidden />
    </button>
  );
}
