"use client";

import { Sparkles } from "lucide-react";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import { cn } from "@/lib/utils";

export type AIInlineActionButtonProps = {
  actionId: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  icon?: boolean;
};

export function AIInlineActionButton({
  actionId,
  label,
  variant = "secondary",
  className,
  icon = true,
}: AIInlineActionButtonProps) {
  const { runInlineAction } = useAICompanion();

  const styles = {
    primary: "bg-[var(--adpilot-accent)] text-white hover:opacity-95",
    secondary:
      "border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] text-[var(--adpilot-text-primary)] hover:bg-[var(--adpilot-nav-active-bg)]",
    ghost: "text-[var(--adpilot-accent)] hover:bg-[var(--adpilot-nav-active-bg)]",
  };

  return (
    <button
      type="button"
      onClick={() => runInlineAction(actionId, label)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--adpilot-radius-item)] px-2.5 py-1.5 text-xs font-medium transition-colors",
        styles[variant],
        className,
      )}
    >
      {icon ? <Sparkles className="h-3.5 w-3.5 shrink-0" /> : null}
      {label}
    </button>
  );
}
