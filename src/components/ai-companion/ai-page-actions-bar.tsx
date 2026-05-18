"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AIInlineActionButton } from "@/components/ai-companion/ai-inline-action-button";

export type AIPageActionsBarProps = {
  title?: string;
  actions: { actionId: string; label: string }[];
};

export function AIPageActionsBar({ title = "AI Quick Actions", actions }: AIPageActionsBarProps) {
  return (
    <Card title={title}>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--adpilot-accent)]/10 text-[var(--adpilot-accent)]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <AIInlineActionButton key={a.actionId} actionId={a.actionId} label={a.label} />
          ))}
        </div>
      </div>
    </Card>
  );
}
