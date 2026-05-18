"use client";

import { AccountSelector } from "@/components/topbar/account-selector";
import { DateRangePickerPlaceholder } from "@/components/topbar/date-range-picker";
import { usePageToolbarContext } from "@/components/layout/page-toolbar-context";
import { Button } from "@/components/ui/button";

export type TopbarProps = {
  title: string;
  agencyName: string;
};

export function Topbar({ title, agencyName }: TopbarProps) {
  const { config } = usePageToolbarContext();

  const showDateRange = config.showDateRange !== false;
  const showExport = config.showExport !== false;
  const showAccount = config.showAccount !== false;

  return (
    <header className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-6 py-3">
      <div className="min-w-0">
        <h1 className="text-base font-semibold text-[var(--adpilot-text-primary)]">{title}</h1>
        {config.meta ? <div className="mt-1">{config.meta}</div> : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showDateRange ? <DateRangePickerPlaceholder /> : null}
        {config.secondaryAction ? (
          <Button type="button" variant="secondary" onClick={config.secondaryAction.onClick}>
            {config.secondaryAction.label}
          </Button>
        ) : null}
        {showExport ? (
          <Button type="button" variant="secondary">
            Export
          </Button>
        ) : null}
        {config.primaryAction ? (
          <Button
            type="button"
            variant={config.primaryAction.variant ?? "primary"}
            onClick={config.primaryAction.onClick}
          >
            {config.primaryAction.label}
          </Button>
        ) : null}
        {showAccount ? <AccountSelector agencyName={agencyName} /> : null}
      </div>
    </header>
  );
}
