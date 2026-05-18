"use client";

import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AIInlineActionButton } from "@/components/ai-companion/ai-inline-action-button";

export function AIOverviewActions() {
  return (
    <Card title="AI Quick Actions">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--adpilot-accent)]/10 text-[var(--adpilot-accent)]">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex flex-wrap gap-2">
          <AIInlineActionButton actionId="ov-explain" label="Explain performance" />
          <AIInlineActionButton actionId="ov-client" label="Generate client update" />
          <AIInlineActionButton actionId="ov-exec" label="Create weekly summary" />
        </div>
      </div>
    </Card>
  );
}
