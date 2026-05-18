"use client";

import {
  MOCK_AI_IMPACT_TIMELINE,
  MOCK_ANALYTICS_CAMPAIGNS,
  MOCK_ANALYTICS_KPIS,
  MOCK_ANALYTICS_PLATFORMS,
  MOCK_ANALYTICS_TREND,
  MOCK_AUDIENCE_PERFORMANCE,
  MOCK_CREATIVE_TYPE_SUMMARY,
} from "@/lib/mock/analytics.mock";
import { AIPageActionsBar } from "@/components/ai-companion/ai-page-actions-bar";
import { Card } from "@/components/ui/card";
import { DualTrendChart } from "@/components/ui/simple-chart";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export function AnalyticsPage() {
  const trendData = MOCK_ANALYTICS_TREND.map((d) => ({
    label: d.date,
    spend: d.spend,
    roas: d.roas,
  }));

  return (
    <>
      <div className="space-y-6 p-6">
        <AIPageActionsBar
          actions={[
            { actionId: "an-trend", label: "Explain trend changes" },
            { actionId: "an-drivers", label: "Find performance drivers" },
            { actionId: "an-platform", label: "Compare platforms" },
            { actionId: "an-audience", label: "Summarize audience insights" },
          ]}
        />

        <div className="flex flex-wrap gap-2">
          {["7D", "14D", "30D", "90D", "Custom"].map((p) => (
            <button
              key={p}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-medium ${p === "30D" ? "border-[var(--adpilot-accent)] bg-[var(--adpilot-nav-active-bg)]" : "border-[var(--adpilot-border)]"}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MOCK_ANALYTICS_KPIS.map((k) => (
            <div key={k.label} className="rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4">
              <p className="text-xs uppercase text-[var(--adpilot-text-muted)]">{k.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</p>
              <p className={`mt-1 text-xs ${k.direction === "up" ? "text-emerald-700" : k.direction === "down" ? "text-red-700" : "text-[var(--adpilot-text-muted)]"}`}>
                {k.delta}
              </p>
            </div>
          ))}
        </div>

        <Card title="Spend & ROAS Trend">
          <DualTrendChart data={trendData} />
        </Card>

        <Card title="Campaign-Level Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                  {["Campaign", "Spend", "Revenue", "ROAS", "Impressions", "Clicks", "CTR", "CPC", "CPM", "Conv. Rate"].map(
                    (h) => (
                      <th key={h} className="py-2 pr-3 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {MOCK_ANALYTICS_CAMPAIGNS.map((c) => (
                  <tr key={c.name} className="border-b border-[var(--adpilot-border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{c.name}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(c.spend)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(c.revenue)}</td>
                    <td className="py-2 pr-3 tabular-nums">{c.roas.toFixed(2)}x</td>
                    <td className="py-2 pr-3 tabular-nums">{formatNumber(c.impressions)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatNumber(c.clicks)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatPercent(c.ctr, 1)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(c.cpc)}</td>
                    <td className="py-2 pr-3 tabular-nums">{formatCurrency(c.cpm)}</td>
                    <td className="py-2 tabular-nums">{formatPercent(c.convRate, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {MOCK_ANALYTICS_PLATFORMS.map((p) => (
            <Card key={p.platform} title={p.platform}>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-[var(--adpilot-text-muted)]">Spend</span>
                  <span className="font-medium tabular-nums">{formatCurrency(p.spend!)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--adpilot-text-muted)]">ROAS</span>
                  <span className="font-medium tabular-nums">{p.roas?.toFixed(2)}x</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--adpilot-text-muted)]">Clicks</span>
                  <span className="font-medium tabular-nums">{formatNumber(p.clicks!)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[var(--adpilot-text-muted)]">CPM</span>
                  <span className="font-medium tabular-nums">{formatCurrency(p.cpm!)}</span>
                </li>
              </ul>
            </Card>
          ))}
        </div>

        <Card title="Audience Performance">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                <th className="py-2 pr-3">Audience Type</th>
                <th className="py-2 pr-3">Campaigns</th>
                <th className="py-2 pr-3">Spend</th>
                <th className="py-2 pr-3">ROAS</th>
                <th className="py-2">Reach</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_AUDIENCE_PERFORMANCE.map((a) => (
                <tr key={a.type} className="border-b border-[var(--adpilot-border)] last:border-0">
                  <td className="py-2 pr-3 font-medium">{a.type}</td>
                  <td className="py-2 pr-3">{a.campaigns}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatCurrency(a.spend)}</td>
                  <td className="py-2 pr-3 tabular-nums">{a.roas.toFixed(2)}x</td>
                  <td className="py-2 tabular-nums">{formatNumber(a.reach)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Creative Performance Summary">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                <th className="py-2 pr-3">Creative Type</th>
                <th className="py-2 pr-3">Count</th>
                <th className="py-2 pr-3">Avg ROAS</th>
                <th className="py-2 pr-3">Avg CTR</th>
                <th className="py-2">Total Spend</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CREATIVE_TYPE_SUMMARY.map((c) => (
                <tr key={c.type} className="border-b border-[var(--adpilot-border)] last:border-0">
                  <td className="py-2 pr-3 font-medium">{c.type}</td>
                  <td className="py-2 pr-3">{c.count}</td>
                  <td className="py-2 pr-3 tabular-nums">{c.avgRoas.toFixed(2)}x</td>
                  <td className="py-2 pr-3 tabular-nums">{formatPercent(c.avgCtr, 1)}</td>
                  <td className="py-2 tabular-nums">{formatCurrency(c.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="ROAS Impact from AI Recommendations">
          <p className="mb-3 text-xs text-[var(--adpilot-text-muted)]">
            This section tracks the measurable impact of actions taken from AI Insights.
          </p>
          <ul className="space-y-3">
            {MOCK_AI_IMPACT_TIMELINE.map((item) => (
              <li key={item.date} className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] p-3 text-sm">
                <p className="font-medium text-[var(--adpilot-text-primary)]">
                  {item.date}: {item.action}
                </p>
                <p className="mt-1 text-[var(--adpilot-text-muted)]">{item.impact}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
