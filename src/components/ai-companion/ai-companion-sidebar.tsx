"use client";

import { FormEvent, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { AI_COMPANION_TITLE } from "@/lib/mock/ai-companion.mock";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import { AIGeneratedOutputCard } from "@/components/ai-companion/ai-generated-output-card";
import { Button } from "@/components/ui/button";

export function AICompanionSidebar() {
  const {
    isOpen,
    close,
    contextLine,
    insight,
    suggestedActions,
    messages,
    outputs,
    runSuggestedAction,
    sendMessage,
  } = useAICompanion();
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <>
      <button type="button" className="fixed inset-0 z-[55] bg-black/25" onClick={close} aria-label="Close AI Companion" />
      <aside className="fixed right-0 top-0 z-[60] flex h-full w-full max-w-md flex-col border-l border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] shadow-2xl">
        <header className="shrink-0 border-b border-[var(--adpilot-border)] px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--adpilot-accent)]/10 text-[var(--adpilot-accent)]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-[var(--adpilot-text-primary)]">{AI_COMPANION_TITLE}</h2>
                <p className="text-[11px] text-[var(--adpilot-text-muted)]">{contextLine}</p>
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={close} className="!p-1.5" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-accent)]/20 bg-[var(--adpilot-accent)]/5 px-3 py-2 text-xs leading-relaxed text-[var(--adpilot-text-primary)]">
            {insight}
          </p>
        </header>

        <div className="shrink-0 border-b border-[var(--adpilot-border)] px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--adpilot-text-muted)]">
            Suggested actions
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runSuggestedAction(action.id, action.label)}
                className="rounded-full border border-[var(--adpilot-border)] bg-[var(--adpilot-bg-main)] px-2.5 py-1 text-[11px] font-medium text-[var(--adpilot-text-primary)] transition-colors hover:border-[var(--adpilot-accent)] hover:bg-[var(--adpilot-nav-active-bg)]"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-[var(--adpilot-text-muted)]">
              Pick a suggested action or ask a question below.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[95%] rounded-[var(--adpilot-radius-item)] px-3 py-2 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "ml-auto bg-[var(--adpilot-accent)] text-white"
                      : "mr-auto border border-[var(--adpilot-border)] bg-[var(--adpilot-bg-main)] text-[var(--adpilot-text-primary)]"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          )}

          {outputs.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--adpilot-text-muted)]">
                Generated outputs
              </p>
              {outputs.map((out) => (
                <AIGeneratedOutputCard key={out.id} output={out} actionState={out.actionState} compact />
              ))}
            </div>
          ) : null}
        </div>

        <footer className="shrink-0 border-t border-[var(--adpilot-border)] p-3">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about performance, reports, creatives..."
              className="min-w-0 flex-1 rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-bg-main)] px-3 py-2 text-sm text-[var(--adpilot-text-primary)] placeholder:text-[var(--adpilot-text-muted)]"
            />
            <Button type="submit" variant="primary" className="shrink-0">
              Send
            </Button>
          </form>
        </footer>
      </aside>
    </>
  );
}
