import type { ComponentProps } from "react";
import type { AlertFeedItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AlertItemProps = {
  alert: AlertFeedItem;
  className?: string;
};

const severityVariant: Record<AlertFeedItem["severity"], NonNullable<ComponentProps<typeof Badge>["variant"]>> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "muted",
};

export function AlertItem({ alert, className }: AlertItemProps) {
  return (
    <article
      className={cn(
        "flex flex-col gap-1 rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-3",
        !alert.isRead && "border-l-4 border-l-[var(--adpilot-accent)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span aria-hidden>{alert.icon}</span>
        <Badge variant={severityVariant[alert.severity]}>{alert.severity}</Badge>
        <span className="text-xs font-medium text-[var(--adpilot-text-primary)]">{alert.title}</span>
        <span className="ml-auto text-xs text-[var(--adpilot-text-muted)]">{alert.timeAgo}</span>
      </div>
      <p className="text-sm text-[var(--adpilot-text-muted)]">{alert.description}</p>
      <p className="text-xs text-[var(--adpilot-text-muted)]">{alert.campaignName}</p>
    </article>
  );
}
