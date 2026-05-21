"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Play,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { ReportingDebugPageData } from "@/lib/meta/reporting-debug";
import type { MetaReportingSyncType } from "@/lib/meta/sync/types";
import { formatDisplayAccountId } from "@/lib/meta/display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SYNC_JOB_OPTIONS: { id: MetaReportingSyncType; label: string }[] = [
  { id: "account_daily", label: "Account daily" },
  { id: "campaign_insights", label: "Campaign insights" },
  { id: "adset_insights", label: "Ad set insights" },
  { id: "ad_insights", label: "Ad insights" },
  { id: "breakdown_platform", label: "Platform breakdown" },
  { id: "creatives", label: "Creatives" },
];

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "success"
      ? "success"
      : status === "failed"
        ? "danger"
        : status === "running"
          ? "warning"
          : "muted";
  return <Badge variant={variant}>{status}</Badge>;
}

function CoverageRow({ label, available }: { label: string; available: boolean }) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="text-zinc-700">{label}</span>
      <span
        className={cn(
          "inline-flex items-center gap-1 font-medium",
          available ? "text-emerald-700" : "text-zinc-400",
        )}
      >
        {available ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        ) : (
          <XCircle className="h-4 w-4" aria-hidden />
        )}
        {available ? "Available" : "Missing"}
      </span>
    </li>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

export function MetaReportingDebugPage({ data }: { data: ReportingDebugPageData }) {
  const router = useRouter();
  const [selectedJobs, setSelectedJobs] = useState<MetaReportingSyncType[]>(() =>
    SYNC_JOB_OPTIONS.map((j) => j.id),
  );
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const failedRuns = useMemo(
    () => data.syncRuns.filter((r) => r.status === "failed").length,
    [data.syncRuns],
  );

  const toggleJob = (id: MetaReportingSyncType) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id],
    );
  };

  const handleRunSync = async () => {
    if (syncing || selectedJobs.length === 0 || !data.selectedAccount) return;
    setSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await fetch("/api/meta/sync/reporting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adAccountId: data.selectedAccount.meta_ad_account_id,
          datePreset: "maximum",
          jobs: selectedJobs,
          includeOverview: false,
        }),
      });

      const body = (await res.json()) as {
        ok?: boolean;
        jobs?: { syncType: string; ok: boolean; error?: { message: string } }[];
      };

      const failed = body.jobs?.filter((j) => !j.ok) ?? [];
      if (body.ok) {
        setSyncFeedback(`Sync finished. ${body.jobs?.length ?? 0} job(s) completed.`);
      } else {
        setSyncFeedback(
          failed.length > 0
            ? `Partial failure: ${failed.map((f) => `${f.syncType}: ${f.error?.message ?? "failed"}`).join("; ")}`
            : "Sync completed with errors. Check sync runs below.",
        );
      }
      router.refresh();
    } catch {
      setSyncFeedback("Request failed. Check network and try again.");
    } finally {
      setSyncing(false);
    }
  };

  if (!data.canAccess) {
    return <AccessDeniedView data={data} />;
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-amber-800">
            Internal · Developer only · Not for clients
          </p>
          <h1 className="text-xl font-semibold">Meta reporting data audit</h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-600">
            Inspect cached Meta reporting tables after{" "}
            <code className="rounded bg-zinc-100 px-1 text-xs">POST /api/meta/sync/reporting</code>.
            Does not change the Overview UI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">Owner / Admin</Badge>
          {!data.metaConfigured && <Badge variant="warning">Meta env not configured</Badge>}
        </div>
      </header>

      <DebugWarningBanner />

      <Card title="Account context">
        {data.selectedAccount ? (
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <DetailRow label="Account" value={data.selectedAccount.meta_ad_account_name} />
            <DetailRow
              label="Meta ID"
              value={formatDisplayAccountId(data.selectedAccount.meta_ad_account_id)}
            />
            <DetailRow label="Organization" value={data.organizationName} />
            <DetailRow label="Connected row ID" value={data.selectedAccount.id} />
          </dl>
        ) : (
          <p className="text-sm text-zinc-600">No connected ad account. Connect Meta first.</p>
        )}
      </Card>

      <Card title="Run reporting sync">
        <p className="mb-3 text-xs text-zinc-500">
          Uses date preset <strong>maximum</strong> (all time). Overview snapshot is not included —
          use Overview refresh for that.
        </p>
        <div className="flex flex-wrap gap-3">
          {SYNC_JOB_OPTIONS.map((job) => (
            <label
              key={job.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedJobs.includes(job.id)}
                onChange={() => toggleJob(job.id)}
                disabled={syncing || !data.selectedAccount}
                className="rounded border-zinc-300"
              />
              {job.label}
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleRunSync}
            disabled={syncing || !data.selectedAccount || selectedJobs.length === 0}
          >
            {syncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Play className="mr-2 h-4 w-4" aria-hidden />
            )}
            Run reporting sync
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.refresh()}
            disabled={syncing}
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
            Refresh audit
          </Button>
        </div>
        {syncFeedback ? <p className="mt-3 text-sm text-zinc-700">{syncFeedback}</p> : null}
      </Card>

      <Card title="Data coverage">
        <ul className="space-y-2">
          <CoverageRow
            label="Traffic metrics (spend / impressions)"
            available={data.coverage.trafficMetrics}
          />
          <CoverageRow label="Purchases" available={data.coverage.purchases} />
          <CoverageRow label="Leads" available={data.coverage.leads} />
          <CoverageRow label="Conversion value" available={data.coverage.conversionValue} />
          <CoverageRow label="ROAS" available={data.coverage.roas} />
          <CoverageRow
            label="Platform breakdown rows"
            available={data.coverage.platformBreakdown}
          />
          <CoverageRow label="Creative metadata rows" available={data.coverage.creativeMetadata} />
        </ul>
        {data.coverage.notes.length > 0 ? (
          <ul className="mt-4 space-y-1 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
            {data.coverage.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        ) : null}
      </Card>

      <Card title={`Stored tables (${data.tables.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                <th className="py-2 pr-4 font-medium">Table</th>
                <th className="py-2 pr-4 font-medium">Rows</th>
                <th className="py-2 pr-4 font-medium">Date start</th>
                <th className="py-2 pr-4 font-medium">Date end</th>
                <th className="py-2 font-medium">Latest write</th>
              </tr>
            </thead>
            <tbody>
              {data.tables.map((row) => (
                <tr key={row.table} className="border-b border-zinc-50">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium text-zinc-800">{row.label}</span>
                    <br />
                    <code className="text-xs text-zinc-400">{row.table}</code>
                  </td>
                  <td className="py-2.5 pr-4 tabular-nums">
                    {row.rowCount === 0 ? (
                      <span className="text-zinc-400">0</span>
                    ) : (
                      row.rowCount.toLocaleString()
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-zinc-600">{row.dateStart ?? "—"}</td>
                  <td className="py-2.5 pr-4 text-zinc-600">{row.dateEnd ?? "—"}</td>
                  <td className="py-2.5 text-zinc-600">{formatTimestamp(row.latestSyncedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title={`Sync runs (latest ${data.syncRuns.length})`}>
        {failedRuns > 0 ? (
          <p className="mb-3 text-sm text-red-700">{failedRuns} failed run(s) in this window.</p>
        ) : null}
        {data.syncRuns.length === 0 ? (
          <p className="text-sm text-zinc-500">No sync runs recorded for this account yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="py-2 pr-3 font-medium">Type</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 pr-3 font-medium">Started</th>
                  <th className="py-2 pr-3 font-medium">Finished</th>
                  <th className="py-2 pr-3 font-medium">Duration</th>
                  <th className="py-2 font-medium">Error</th>
                </tr>
              </thead>
              <tbody>
                {data.syncRuns.map((run) => (
                  <tr key={run.id} className="border-b border-zinc-50 align-top">
                    <td className="py-2 pr-3 font-mono text-xs">{run.syncType}</td>
                    <td className="py-2 pr-3">
                      <StatusBadge status={run.status} />
                    </td>
                    <td className="py-2 pr-3 text-zinc-600">{formatTimestamp(run.startedAt)}</td>
                    <td className="py-2 pr-3 text-zinc-600">{formatTimestamp(run.finishedAt)}</td>
                    <td className="py-2 pr-3 tabular-nums text-zinc-600">
                      {formatDuration(run.durationMs)}
                    </td>
                    <td className="max-w-xs py-2 text-xs text-red-700">
                      {run.errorMessage ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-zinc-400">
        <Link href="/settings" className="hover:underline">
          Settings
        </Link>
        {" · "}
        <Link href="/ad-accounts/meta-data-explorer" className="hover:underline">
          Meta Data Explorer
        </Link>
        {" · "}
        <Link href="/" className="hover:underline">
          Overview
        </Link>
      </p>
    </div>
  );
}

function AccessDeniedView({ data }: { data: ReportingDebugPageData }) {
  return (
    <div className="space-y-6 p-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-amber-800">
          Internal · Developer only
        </p>
        <h1 className="text-xl font-semibold">Meta reporting data audit</h1>
      </header>
      <Card>
        <p className="text-sm text-zinc-600">
          {data.accessDeniedReason ?? "You do not have access to this page."}
        </p>
        <Link
          href="/settings"
          className="mt-3 inline-block text-sm text-[var(--adpilot-accent)] hover:underline"
        >
          Back to Settings
        </Link>
      </Card>
    </div>
  );
}

function DebugWarningBanner() {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <WarningBannerContent />
    </div>
  );
}

function WarningBannerContent() {
  return (
    <div className="flex gap-2">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        Debug view only. Counts reflect the <strong>selected ad account</strong>. Change account in
        Settings → Integrations, then refresh this page.
      </p>
    </div>
  );
}
