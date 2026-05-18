"use client";

import { useState } from "react";
import type { NormalizedCampaignSummary } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { OverviewCard } from "@/components/overview/overview-shell";
import {
  filterCampaignsByTab,
  getCampaignSignalLabel,
  getCampaignSignalVariant,
  type CampaignTab,
} from "@/lib/data/campaign-signals";
import { formatCurrency } from "@/lib/utils";

const TAB_ITEMS: { id: CampaignTab; label: string }[] = [
  { id: "winners", label: "Top Winners" },
  { id: "attention", label: "Needs Attention" },
  { id: "spend", label: "Highest Spend" },
];

export function CampaignSignalsCard({ campaigns }: { campaigns: NormalizedCampaignSummary[] }) {
  const [tab, setTab] = useState<CampaignTab>("winners");
  const filtered = filterCampaignsByTab(campaigns, tab);

  return (
    <OverviewCard
      title="Campaign performance"
      subtitle="Signals are advisory — apply changes in Meta Ads Manager"
    >
      <Tabs items={TAB_ITEMS} value={tab} onChange={setTab} className="mb-4" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <th className="pb-2 pr-4 font-medium">Campaign</th>
              <th className="pb-2 pr-4 font-medium">Signal</th>
              <th className="pb-2 pr-4 font-medium">Spend</th>
              <th className="pb-2 pr-4 font-medium">Results</th>
              <th className="pb-2 pr-4 font-medium">ROAS</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const signal = c.signal;
              return (
                <tr key={c.id} className="border-b border-zinc-100 last:border-0">
                  <td className="py-3 pr-4 font-medium text-zinc-900">{c.name}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={getCampaignSignalVariant(signal)} className="whitespace-nowrap">
                      {getCampaignSignalLabel(signal)}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 tabular-nums text-zinc-700">{formatCurrency(c.spend)}</td>
                  <td className="py-3 pr-4 tabular-nums text-zinc-700">{formatCurrency(c.revenue)}</td>
                  <td className="py-3 pr-4 tabular-nums font-medium text-zinc-900">{c.roas.toFixed(2)}x</td>
                  <td className="py-3">
                    <Badge variant={c.status === "paused" ? "warning" : "success"}>{c.status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500">No campaigns in this view for the current filters.</p>
      ) : null}
    </OverviewCard>
  );
}
