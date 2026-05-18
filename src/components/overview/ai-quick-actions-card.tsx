"use client";

import { Sparkles } from "lucide-react";
import type { AIQuickAction } from "@/lib/data/types";
import { AIInlineActionButton } from "@/components/ai-companion/ai-inline-action-button";
import { OverviewCard } from "@/components/overview/overview-shell";

export function AiQuickActionsCard({ actions }: { actions: AIQuickAction[] }) {
  return (
    <OverviewCard title="AI quick actions" subtitle="Opens Agency Copilot · mock responses only">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1877f2]/10 text-[#1877f2]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <AIInlineActionButton key={a.actionId} actionId={a.actionId} label={a.label} />
          ))}
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
        Copilot summarizes read-only insights. It cannot pause, publish, or edit campaigns.
      </p>
    </OverviewCard>
  );
}
