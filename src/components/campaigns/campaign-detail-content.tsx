"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Copy, ExternalLink, Sparkles } from "lucide-react";
import type { CampaignDetailData, CampaignDetailDataFound } from "@/lib/data/types";
import { getCampaignSignalLabel, getCampaignSignalVariant } from "@/lib/data/campaign-signals";
import { CampaignDetailAI } from "@/components/campaigns/campaign-detail-ai";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineAreaChart, MiniStatCard } from "@/components/ui/simple-chart";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import type { NormalizedCampaignStatus } from "@/lib/data/types";

function statusVariant(status: NormalizedCampaignStatus) {
  if (status === "active") return "success" as const;
  if (status === "paused" || status === "ended") return "warning" as const;
  if (status === "learning") return "muted" as const;
  return "danger" as const;
}

function completenessLabel(level: CampaignDetailDataFound["dataCompleteness"]) {
  if (level === "full") return "Full data";
  if (level === "partial") return "Partial data";
  return "Limited data";
}

function MetricValue({
  label,
  value,
  missing,
}: {
  label: string;
  value: string;
  missing?: boolean;
}) {
  return (
    <MiniStatCard
      label={label}
      value={missing ? "—" : value}
    />
  );
}

function CampaignDetailBody({ data }: { data: CampaignDetailDataFound }) {
  const { campaign, metrics } = data;
  const [copied, setCopied] = useState(false);

  const copyManualAction = async () => {
    try {
      await navigator.clipboard.writeText(campaign.manualActionNote);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--adpilot-border)] bg-[#fafaf8] px-3 py-2.5 text-xs leading-relaxed text-[var(--adpilot-text-muted)]">
        {data.readOnlyNotice}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={getCampaignSignalVariant(campaign.signal)}>{getCampaignSignalLabel(campaign.signal)}</Badge>
        <Badge variant={statusVariant(campaign.status)}>{campaign.status}</Badge>
        {campaign.objective ? <Badge variant="muted">{campaign.objective}</Badge> : null}
        <Badge variant={data.dataCompleteness === "limited" ? "warning" : "muted"}>
          {completenessLabel(data.dataCompleteness)}
        </Badge>
      </div>

      {(data.schedule.startDate || data.schedule.endDate) && (
        <p className="text-xs text-[var(--adpilot-text-muted)]">
          Campaign schedule: {data.schedule.startDate ?? "—"} → {data.schedule.endDate ?? "—"} · Report range:{" "}
          {data.dateRange.detailLabel ?? `${data.dateRange.start} – ${data.dateRange.end}`}
        </p>
      )}

      {data.warnings.length > 0 ? (
        <div className="space-y-2">
          {data.warnings.map((w) => (
            <div
              key={w.id}
              className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-sm"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
              <div>
                <p className="font-medium text-amber-900">{w.title}</p>
                <p className="mt-0.5 text-xs text-amber-800/90">{w.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricValue label="Spend" value={formatCurrency(metrics.spend)} />
        <MetricValue label="Revenue" value={formatCurrency(metrics.revenue)} />
        <MetricValue label="ROAS" value={`${metrics.roas.toFixed(2)}x`} />
        <MetricValue
          label="CPA"
          value={metrics.cpa != null ? formatCurrency(metrics.cpa) : "—"}
          missing={metrics.cpa == null}
        />
        <MetricValue
          label="CTR"
          value={metrics.ctr != null ? formatPercent(metrics.ctr, 1) : "—"}
          missing={metrics.ctr == null}
        />
        <MetricValue
          label="CPC"
          value={metrics.cpc != null ? formatCurrency(metrics.cpc) : "—"}
          missing={metrics.cpc == null}
        />
        <MetricValue
          label="CPM"
          value={metrics.cpm != null ? formatCurrency(metrics.cpm) : "—"}
          missing={metrics.cpm == null}
        />
        <MetricValue
          label="Impressions"
          value={metrics.impressions != null ? formatNumber(metrics.impressions) : "—"}
          missing={metrics.impressions == null}
        />
        <MetricValue
          label="Results"
          value={metrics.conversions != null ? formatNumber(metrics.conversions) : "—"}
          missing={metrics.conversions == null}
        />
      </div>

      <Card title="Suggested manual action">
        <p className="text-sm leading-relaxed text-[var(--adpilot-text-primary)]">{campaign.manualActionNote}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" className="gap-1.5 text-xs" onClick={copyManualAction}>
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copied" : "Copy manual action"}
          </Button>
          {data.metaAdsManagerUrl ? (
            <a
              href={data.metaAdsManagerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-3 py-2 text-xs font-medium text-[var(--adpilot-text-primary)] hover:bg-[var(--adpilot-nav-active-bg)]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View in Meta Ads Manager
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-[var(--adpilot-radius-item)] border border-dashed border-[var(--adpilot-border)] px-3 py-2 text-xs text-[var(--adpilot-text-muted)]">
              <ExternalLink className="h-3.5 w-3.5" />
              Meta Ads Manager (connect account)
            </span>
          )}
          <Link
            href="/ai-insights"
            className="inline-flex items-center gap-1.5 rounded-[var(--adpilot-radius-item)] px-3 py-2 text-xs font-medium text-[var(--adpilot-accent)] hover:bg-[var(--adpilot-nav-active-bg)]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Open recommendations
          </Link>
        </div>
      </Card>

      {data.dailyTrend.length > 0 ? (
        <Card title="Spend over time (14 days)">
          <LineAreaChart data={data.dailyTrend.map((d) => ({ date: d.date, value: d.spend }))} />
        </Card>
      ) : (
        <Card title="Spend over time">
          <p className="text-sm text-[var(--adpilot-text-muted)]">Daily trend data is not available for this campaign.</p>
        </Card>
      )}

      <Card title="Ad sets">
        {data.adSets.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                <th className="py-2 pr-2">Name</th>
                <th className="py-2 pr-2">Spend</th>
                <th className="py-2 pr-2">ROAS</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.adSets.map((a) => (
                <tr key={a.id} className="border-b border-[var(--adpilot-border)] last:border-0">
                  <td className="py-2 pr-2 font-medium">{a.name}</td>
                  <td className="py-2 pr-2 tabular-nums">{formatCurrency(a.spend)}</td>
                  <td className="py-2 pr-2 tabular-nums">{a.roas.toFixed(2)}x</td>
                  <td className="py-2">
                    <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-[var(--adpilot-text-muted)]">No ad set breakdown available.</p>
        )}
      </Card>

      <CampaignDetailAI campaignName={campaign.name} />

      <Card title="Active creatives">
        {data.creatives.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.creatives.map((cr) => (
              <div
                key={cr.id}
                className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] p-2"
              >
                <div className="mb-2 h-20 rounded-md" style={{ background: cr.thumbnailColor }} />
                <p className="text-sm font-medium">{cr.name}</p>
                <p className="text-xs text-[var(--adpilot-text-muted)]">
                  {cr.format} · {cr.roas.toFixed(2)}x ROAS · {formatPercent(cr.ctr, 1)} CTR
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--adpilot-text-muted)]">Creative-level data is not connected for this campaign yet.</p>
        )}
      </Card>

      <Card title="Read-only insights">
        {data.insights.length > 0 ? (
          <ul className="space-y-3">
            {data.insights.map((tip) => (
              <li
                key={tip.id}
                className={`rounded-[var(--adpilot-radius-item)] border p-3 ${
                  tip.variant === "warning"
                    ? "border-amber-200 bg-amber-50/50"
                    : "border-[var(--adpilot-border)]"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--adpilot-text-primary)]">{tip.title}</p>
                <p className="mt-1 text-sm text-[var(--adpilot-text-muted)]">{tip.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--adpilot-text-muted)]">No additional insights for this period.</p>
        )}
      </Card>

      {metrics.missingFields.length > 0 ? (
        <p className="text-xs text-[var(--adpilot-text-muted)]">
          Missing metrics: {metrics.missingFields.join(", ")}.
        </p>
      ) : null}
    </div>
  );
}

export function CampaignDetailContent({ data }: { data: CampaignDetailData }) {
  if (!data.found) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-[var(--adpilot-text-muted)]" />
        <h3 className="text-base font-semibold text-[var(--adpilot-text-primary)]">Campaign not found</h3>
        <p className="max-w-sm text-sm text-[var(--adpilot-text-muted)]">{data.message}</p>
        <Link href="/campaigns" className="text-sm font-medium text-[var(--adpilot-accent)] hover:underline">
          Back to campaigns
        </Link>
      </div>
    );
  }

  return <CampaignDetailBody data={data} />;
}
