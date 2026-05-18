"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { campaignDetailParams, getCampaignDetailData } from "@/lib/data/get-dashboard-data";
import { CampaignDetailContent } from "@/components/campaigns/campaign-detail-content";
import { Button } from "@/components/ui/button";
import { getCampaignSignalLabel, getCampaignSignalVariant } from "@/lib/data/campaign-signals";
import { Badge } from "@/components/ui/badge";

export function CampaignDetailPanel({ campaignId, onClose }: { campaignId: string; onClose: () => void }) {
  const data = useMemo(() => getCampaignDetailData(campaignDetailParams(campaignId)), [campaignId]);

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-label="Close panel" />
      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col border-l border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] shadow-xl">
        <header className="flex items-start justify-between gap-3 border-b border-[var(--adpilot-border)] p-4">
          <div className="min-w-0 flex-1">
            {data.found ? (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-[var(--adpilot-text-primary)]">{data.campaign.name}</h2>
                <Badge variant={getCampaignSignalVariant(data.campaign.signal)}>
                  {getCampaignSignalLabel(data.campaign.signal)}
                </Badge>
              </div>
            ) : (
              <h2 className="text-base font-semibold text-[var(--adpilot-text-primary)]">Campaign detail</h2>
            )}
          </div>
          <Button type="button" variant="ghost" onClick={onClose} className="!p-1.5">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <CampaignDetailContent data={data} />
        </div>
      </aside>
    </>
  );
}
