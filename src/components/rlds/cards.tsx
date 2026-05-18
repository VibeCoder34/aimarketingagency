import { Ellipsis, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AchievementRowProps = {
  title: string;
  subtitle?: string;
  percent: number;
  className?: string;
};

export function AchievementRow({ title, subtitle, percent, className }: AchievementRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-rlds-md rounded-rlds-md bg-rlds-surface p-rlds-md shadow-[var(--shadow-rlds-bevel)] ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      <div className="h-16 w-24 shrink-0 rounded-rlds-sm bg-gradient-to-br from-teal-300 to-fuchsia-500" />
      <div className="min-w-0 flex-1">
        <p className="rlds-body-1-em truncate text-rlds-fg">{title}</p>
        {subtitle ? <p className="rlds-meta truncate text-rlds-fg-tertiary">{subtitle}</p> : null}
        <div className="mt-rlds-sm flex items-center gap-rlds-sm">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-rlds-ui shadow-inner">
            <div className="h-full rounded-full bg-rlds-inverse" style={{ width: `${percent}%` }} />
          </div>
          <span className="rlds-meta tabular-nums text-rlds-fg-secondary">{percent}%</span>
        </div>
      </div>
    </div>
  );
}

export type ImageCardProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  selected?: boolean;
  className?: string;
};

export function ImageCard({ title, subtitle, badge, selected, className }: ImageCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-rlds-md bg-rlds-surface shadow-[var(--shadow-rlds-bevel)] ring-1 ring-black/5 dark:ring-white/10",
        className,
      )}
    >
      <div className="relative aspect-video bg-gradient-to-br from-cyan-300 to-violet-500">
        {badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 rlds-meta text-white">
            {badge}
          </span>
        ) : null}
        {selected ? (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-rlds-fg shadow">
            ✓
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-rlds-md">
        <p className="rlds-body-1-em text-rlds-fg">{title}</p>
        {subtitle ? <p className="rlds-meta text-rlds-fg-tertiary">{subtitle}</p> : null}
      </div>
      <div className="flex items-center justify-end gap-rlds-sm border-t border-rlds-divider px-rlds-md py-rlds-sm text-rlds-fg-secondary">
        <button type="button" className="rounded-full p-1.5 hover:bg-rlds-ui-2" aria-label="Paylaş">
          <Share2 className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <button type="button" className="rounded-full p-1.5 hover:bg-rlds-ui-2" aria-label="Menü">
          <Ellipsis className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </article>
  );
}
