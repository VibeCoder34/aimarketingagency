"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  META_OVERVIEW_DATE_PRESETS,
  resolveOverviewDatePreset,
} from "@/lib/meta/overview-date-presets";
import { Clock, Database, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import type { AccountOverviewContext } from "@/lib/data/types";
import { formatDisplayAccountId } from "@/lib/meta/display";
import type { ConnectedMetaAdAccountRow } from "@/lib/meta/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type RefreshFeedback = {
  tone: "success" | "warning" | "error";
  message: string;
} | null;

export function OverviewContextBar({
  context,
  metaAccounts = [],
  showAccountPicker = false,
}: {
  context: AccountOverviewContext;
  metaAccounts?: ConnectedMetaAdAccountRow[];
  showAccountPicker?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [switchingAccount, setSwitchingAccount] = useState(false);
  const [feedback, setFeedback] = useState<RefreshFeedback>(null);

  const isDemo = context.dataSourceLabel === "demo";
  const canRefresh = Boolean(context.canRefreshData) && !isDemo;
  const showDateRangePicker = !isDemo && context.dataSourceLabel === "live_meta";
  const selectedPreset = resolveOverviewDatePreset(
    context.dateRangePreset ?? searchParams.get("range"),
  );

  const selectedAccountRowId =
    context.connectedMetaAdAccountUuid ??
    metaAccounts.find((a) => a.is_selected)?.id ??
    "";

  function handleDateRangeChange(nextPreset: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", nextPreset);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  async function handleAccountChange(accountRowId: string) {
    if (!accountRowId || accountRowId === selectedAccountRowId || switchingAccount) {
      return;
    }

    setSwitchingAccount(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/meta/ad-accounts/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: accountRowId }),
      });

      const body = (await res.json()) as {
        ok?: boolean;
        error?: { message?: string };
      };

      if (body.ok) {
        router.refresh();
        return;
      }

      setFeedback({
        tone: "error",
        message: body.error?.message ?? "Could not switch ad account.",
      });
    } catch {
      setFeedback({ tone: "error", message: "Could not switch ad account." });
    } finally {
      setSwitchingAccount(false);
    }
  }

  async function handleRefresh() {
    if (!canRefresh || refreshing || switchingAccount || !selectedAccountRowId) {
      return;
    }

    setRefreshing(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/meta/sync/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(context.metaAdAccountId ? { adAccountId: context.metaAdAccountId } : {}),
          datePreset: selectedPreset,
        }),
      });

      const body = (await res.json()) as {
        ok?: boolean;
        throttled?: boolean;
        message?: string;
        error?: { message?: string };
      };

      if (body.ok) {
        setFeedback({ tone: "success", message: "Meta data refreshed." });
        router.refresh();
        return;
      }

      if (body.throttled && body.message) {
        setFeedback({ tone: "warning", message: body.message });
        return;
      }

      const message =
        body.error?.message ??
        (res.status === 429
          ? "Data was refreshed recently. Please wait before trying again."
          : "Couldn't refresh Meta data. Showing last successful sync.");

      setFeedback({ tone: "error", message });
    } catch {
      setFeedback({
        tone: "error",
        message:
          context.lastSyncedAgo === "never"
            ? "Couldn't load Meta data. Please try again."
            : "Couldn't refresh Meta data. Showing last successful sync.",
      });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <header className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04)]">
      <ContextBarHeader
        context={context}
        isDemo={isDemo}
        canRefresh={canRefresh}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showDateRangePicker={showDateRangePicker}
        selectedPreset={selectedPreset}
        onDateRangeChange={handleDateRangeChange}
        showAccountPicker={showAccountPicker}
        metaAccounts={metaAccounts}
        selectedAccountRowId={selectedAccountRowId}
        switchingAccount={switchingAccount}
        onAccountChange={handleAccountChange}
        controlsDisabled={refreshing || switchingAccount}
      />
      {feedback ? (
        <p
          className={
            feedback.tone === "success"
              ? "mt-3 text-sm text-emerald-700"
              : feedback.tone === "warning"
                ? "mt-3 text-sm text-amber-700"
                : "mt-3 text-sm text-red-700"
          }
          role="status"
        >
          {feedback.message}
        </p>
      ) : null}

      <Separator className="my-4" />

      <p className="flex items-start gap-2 text-xs leading-relaxed text-zinc-600">
        <Database className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden />
        <span>
          <strong className="font-medium text-zinc-800">AdPilot never edits, pauses, publishes, or changes campaigns.</strong>{" "}
          Analyze performance here, then apply any changes manually in Meta Ads Manager.
        </span>
      </p>
    </header>
  );
}

function ContextBarHeader({
  context,
  isDemo,
  canRefresh,
  refreshing,
  onRefresh,
  showDateRangePicker,
  selectedPreset,
  onDateRangeChange,
  showAccountPicker,
  metaAccounts,
  selectedAccountRowId,
  switchingAccount,
  onAccountChange,
  controlsDisabled,
}: {
  context: AccountOverviewContext;
  isDemo: boolean;
  canRefresh: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  showDateRangePicker: boolean;
  selectedPreset: string;
  onDateRangeChange: (preset: string) => void;
  showAccountPicker: boolean;
  metaAccounts: ConnectedMetaAdAccountRow[];
  selectedAccountRowId: string;
  switchingAccount: boolean;
  onAccountChange: (accountRowId: string) => void;
  controlsDisabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Account overview</p>
          {context.dataSourceBadge ? (
            <Badge variant={isDemo ? "muted" : "success"}>{context.dataSourceBadge}</Badge>
          ) : null}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{context.accountName}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {context.dateRangeLabel}
          {context.dateRangeDetail ? ` · ${context.dateRangeDetail}` : null}
        </p>
        {isDemo && context.demoCtaLabel ? (
          <p className="mt-2 text-sm">
            <Link
              href="/settings?section=integrations"
              className="font-medium text-emerald-700 underline-offset-2 hover:underline"
            >
              {context.demoCtaLabel}
            </Link>
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:items-end">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted" className="gap-1.5 px-2.5 py-1">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Read-only mode
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Last updated {context.lastSyncedAgo}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {showAccountPicker ? (
            <select
              aria-label="Ad account"
              className="h-9 max-w-[220px] rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800 sm:max-w-[280px]"
              value={selectedAccountRowId}
              onChange={(e) => onAccountChange(e.target.value)}
              disabled={controlsDisabled}
            >
              {!selectedAccountRowId ? (
                <option value="" disabled>
                  Choose ad account…
                </option>
              ) : null}
              {metaAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.meta_ad_account_name} ({formatDisplayAccountId(account.meta_ad_account_id)})
                </option>
              ))}
            </select>
          ) : isDemo ? (
            <select
              disabled
              aria-label="Account (demo)"
              className="h-9 cursor-not-allowed rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700 opacity-80"
              defaultValue="northwind"
            >
              <option value="northwind">Northwind Media (demo)</option>
            </select>
          ) : null}
          {showDateRangePicker ? (
            <select
              aria-label="Date range"
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-800"
              value={selectedPreset}
              onChange={(e) => onDateRangeChange(e.target.value)}
              disabled={controlsDisabled}
            >
              {META_OVERVIEW_DATE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          ) : null}
          {canRefresh ? (
            <Button
              type="button"
              variant="secondary"
              disabled={controlsDisabled || !selectedAccountRowId}
              onClick={onRefresh}
              className="h-9 px-3 text-sm"
            >
              {refreshing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Refreshing from Meta…
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
                  Refresh data
                </>
              )}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
