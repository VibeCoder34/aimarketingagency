"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import type { RecommendationStatus } from "@/lib/data/types";

export type RecommendationActionsProps = {
  manualActionSummary: string;
  status: RecommendationStatus;
  onStatusChange: (status: RecommendationStatus) => void;
};

export function RecommendationActions({
  manualActionSummary,
  status,
  onStatusChange,
}: RecommendationActionsProps) {
  const { runInlineAction } = useAICompanion();
  const [reportAdded, setReportAdded] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyManualAction = async () => {
    try {
      await navigator.clipboard.writeText(manualActionSummary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        type="button"
        variant={reportAdded ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={() => {
          runInlineAction("ai-report", "Add to report");
          setReportAdded(true);
        }}
      >
        {reportAdded ? "Added to report" : "Add to report"}
      </Button>
      <Button
        type="button"
        variant={taskCreated ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={() => {
          runInlineAction("ai-tasks", "Create task");
          setTaskCreated(true);
        }}
      >
        {taskCreated ? "Task created" : "Create task"}
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="!px-2 !py-1 text-xs"
        onClick={() => runInlineAction("ai-msg", "Create client message")}
      >
        Generate client message
      </Button>
      <Button
        type="button"
        variant={copied ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={copyManualAction}
      >
        {copied ? "Copied" : "Copy manual action"}
      </Button>
      <Button
        type="button"
        variant={status === "reviewed" ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={() => onStatusChange("reviewed")}
      >
        Mark as reviewed
      </Button>
      <Button
        type="button"
        variant={status === "planned" ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={() => onStatusChange("planned")}
      >
        Mark as planned
      </Button>
      <Button
        type="button"
        variant={status === "done_manually" ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={() => onStatusChange("done_manually")}
      >
        Mark as done manually
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="!px-2 !py-1 text-xs"
        onClick={() => onStatusChange("dismissed")}
      >
        Dismiss
      </Button>
    </div>
  );
}
