import { cn } from "@/lib/utils";

export const overviewCardClass =
  "rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_16px_rgb(0_0_0/0.03)]";

export function OverviewCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn(overviewCardClass, className)}>
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
