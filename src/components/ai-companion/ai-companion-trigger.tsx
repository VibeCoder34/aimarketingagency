"use client";

import { Sparkles } from "lucide-react";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";

export function AICompanionTrigger() {
  const { toggle, isOpen } = useAICompanion();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] px-4 py-3 text-sm font-semibold text-[var(--adpilot-text-primary)] shadow-lg transition-all hover:border-[var(--adpilot-accent)] hover:shadow-xl ${
        isOpen ? "ring-2 ring-[var(--adpilot-accent)]/30" : ""
      }`}
      aria-expanded={isOpen}
      aria-label="Open Agency Copilot"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--adpilot-accent)] text-white">
        <Sparkles className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline">Agency Copilot</span>
    </button>
  );
}
