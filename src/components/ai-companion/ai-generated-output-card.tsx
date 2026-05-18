"use client";

import { Check, Copy, FilePlus, ListTodo, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import type { AiGeneratedOutput, AiOutputActionState } from "@/types/ai-companion";

const TYPE_LABELS: Record<AiGeneratedOutput["type"], string> = {
  report: "Report Draft",
  creative_brief: "Creative Brief",
  optimization_plan: "Optimization Plan",
  client_message: "Client Message",
  campaign_diagnosis: "Campaign Diagnosis",
  task_list: "Task List",
  executive_summary: "Executive Summary",
};

const STATUS_VARIANT: Record<AiGeneratedOutput["status"], "default" | "success" | "warning" | "muted"> = {
  Draft: "muted",
  Suggested: "warning",
  Ready: "success",
  Applied: "default",
};

export function AIGeneratedOutputCard({
  output,
  actionState,
  compact,
}: {
  output: AiGeneratedOutput;
  actionState: AiOutputActionState;
  compact?: boolean;
}) {
  const { updateOutputAction } = useAICompanion();

  if (actionState.dismissed) return null;

  return (
    <article
      className={`rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-bg-main)] ${compact ? "p-2.5" : "p-3"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="default">{TYPE_LABELS[output.type]}</Badge>
        <Badge variant={STATUS_VARIANT[output.status]}>{output.status}</Badge>
      </div>
      <h4 className={`font-semibold text-[var(--adpilot-text-primary)] ${compact ? "mt-1.5 text-xs" : "mt-2 text-sm"}`}>
        {output.title}
      </h4>
      <p className={`text-[var(--adpilot-text-muted)] ${compact ? "mt-0.5 text-[11px]" : "mt-1 text-xs"}`}>
        {output.description}
      </p>
      {output.preview ? (
        <pre
          className={`mt-2 whitespace-pre-wrap rounded border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] font-sans text-[var(--adpilot-text-primary)] ${compact ? "p-2 text-[10px] leading-snug" : "p-2.5 text-xs leading-relaxed"}`}
        >
          {output.preview}
        </pre>
      ) : null}
      <div className={`flex flex-wrap gap-1.5 ${compact ? "mt-2" : "mt-3"}`}>
        <Button
          type="button"
          variant={actionState.saved ? "primary" : "secondary"}
          className="!px-2 !py-1 text-[10px]"
          onClick={() => updateOutputAction(output.id, "saved")}
        >
          {actionState.saved ? (
            <>
              <Check className="mr-1 inline h-3 w-3" /> Saved
            </>
          ) : (
            "Save Draft"
          )}
        </Button>
        <Button
          type="button"
          variant={actionState.addedToReport ? "primary" : "secondary"}
          className="!px-2 !py-1 text-[10px]"
          onClick={() => updateOutputAction(output.id, "addedToReport")}
        >
          {actionState.addedToReport ? (
            <>
              <Check className="mr-1 inline h-3 w-3" /> Added
            </>
          ) : (
            <>
              <FilePlus className="mr-1 inline h-3 w-3" /> Add to Report
            </>
          )}
        </Button>
        <Button
          type="button"
          variant={actionState.copied ? "primary" : "ghost"}
          className="!px-2 !py-1 text-[10px]"
          onClick={() => updateOutputAction(output.id, "copied")}
        >
          {actionState.copied ? (
            <>
              <Check className="mr-1 inline h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 inline h-3 w-3" /> Copy
            </>
          )}
        </Button>
        <Button
          type="button"
          variant={actionState.taskCreated ? "primary" : "ghost"}
          className="!px-2 !py-1 text-[10px]"
          onClick={() => updateOutputAction(output.id, "taskCreated")}
        >
          {actionState.taskCreated ? (
            <>
              <Check className="mr-1 inline h-3 w-3" /> Task created
            </>
          ) : (
            <>
              <ListTodo className="mr-1 inline h-3 w-3" /> Create Task
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="!px-2 !py-1 text-[10px]"
          onClick={() => updateOutputAction(output.id, "dismissed")}
        >
          <X className="mr-1 inline h-3 w-3" /> Dismiss
        </Button>
      </div>
    </article>
  );
}
