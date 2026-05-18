"use client";

import { AI_CAMPAIGN_DIAGNOSIS } from "@/lib/mock/ai-companion.mock";
import { Card } from "@/components/ui/card";
import { AIInlineActionButton } from "@/components/ai-companion/ai-inline-action-button";

export function AIDiagnosisCard({ campaignName }: { campaignName?: string }) {
  return (
    <Card title="AI Diagnosis">
      <p className="text-sm text-[var(--adpilot-text-primary)]">{AI_CAMPAIGN_DIAGNOSIS.summary}</p>
      <ul className="mt-2 list-inside list-disc text-xs text-[var(--adpilot-text-muted)]">
        {AI_CAMPAIGN_DIAGNOSIS.details.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      {campaignName ? (
        <p className="mt-2 text-xs text-[var(--adpilot-text-muted)]">Campaign: {campaignName}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <AIInlineActionButton actionId="cd-plan" label="Create action plan" />
        <AIInlineActionButton actionId="cd-client" label="Write client explanation" variant="ghost" />
        <AIInlineActionButton actionId="cd-creative" label="Generate creative brief" variant="ghost" />
      </div>
    </Card>
  );
}
