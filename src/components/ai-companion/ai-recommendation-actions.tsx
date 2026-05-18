"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";

export type AIRecommendationActionsProps = {
  recId: string;
  onApply: () => void;
  onDismiss: () => void;
};

export function AIRecommendationActions({ onApply, onDismiss }: AIRecommendationActionsProps) {
  const { runInlineAction } = useAICompanion();
  const [reportAdded, setReportAdded] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [briefReady, setBriefReady] = useState(false);

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
        Create client message
      </Button>
      <Button
        type="button"
        variant={briefReady ? "primary" : "secondary"}
        className="!px-2 !py-1 text-xs"
        onClick={() => {
          runInlineAction("cr-ugc", "Generate creative brief");
          setBriefReady(true);
        }}
      >
        {briefReady ? "Brief ready" : "Generate creative brief"}
      </Button>
      <Button type="button" variant="primary" className="!px-2 !py-1 text-xs" onClick={onApply}>
        Mark as done manually
      </Button>
      <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
