"use client";

import { cn } from "@/lib/utils";

export type FilterChipsProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
};

export function FilterChips({ options, value, onChange, label }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label ? <span className="text-xs font-medium text-[var(--adpilot-text-muted)]">{label}</span> : null}
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-150",
            value === opt
              ? "border-[var(--adpilot-accent)] bg-[var(--adpilot-nav-active-bg)] text-[var(--adpilot-text-primary)]"
              : "border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] text-[var(--adpilot-text-muted)] hover:border-[var(--adpilot-text-muted)]",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
