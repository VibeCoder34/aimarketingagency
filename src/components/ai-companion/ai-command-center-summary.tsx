import { AI_COMMAND_CENTER_SECTIONS } from "@/lib/mock/ai-companion.mock";
import { cn } from "@/lib/utils";

const VARIANT_STYLES = {
  default: "border-[var(--adpilot-border)] bg-[var(--adpilot-surface)]",
  danger: "border-red-200 bg-red-50/80",
  success: "border-emerald-200 bg-emerald-50/80",
  warning: "border-amber-200 bg-amber-50/80",
};

export function AICommandCenterSummary() {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {AI_COMMAND_CENTER_SECTIONS.map((section) => (
        <article
          key={section.id}
          className={cn(
            "rounded-[var(--adpilot-radius-card)] border p-4",
            VARIANT_STYLES[section.variant],
          )}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--adpilot-text-muted)]">
            {section.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--adpilot-text-primary)]">{section.body}</p>
        </article>
      ))}
    </section>
  );
}
