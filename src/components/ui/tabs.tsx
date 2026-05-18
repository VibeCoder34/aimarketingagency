"use client";

import { cn } from "@/lib/utils";

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

export type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl border border-[var(--adpilot-border)] bg-[#fafaf8] p-1",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-white text-[var(--adpilot-text-primary)] shadow-sm"
                : "text-[var(--adpilot-text-muted)] hover:text-[var(--adpilot-text-primary)]",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
