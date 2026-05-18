import { cn } from "@/lib/utils";

export type CardProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export function Card({ title, children, className }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4",
        className,
      )}
    >
      {title ? <h2 className="mb-3 text-sm font-semibold text-[var(--adpilot-text-primary)]">{title}</h2> : null}
      {children}
    </section>
  );
}
