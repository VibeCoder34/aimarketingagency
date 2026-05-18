import { cn } from "@/lib/utils";
import type { NavBadge } from "@/types";

export type SidebarBadgeProps = {
  badge: NavBadge;
};

export function SidebarBadge({ badge }: SidebarBadgeProps) {
  const base =
    "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums text-white";
  if (badge.variant === "danger") {
    return <span className={cn(base, "bg-[#dc2626]")}>{badge.count}</span>;
  }
  return <span className={cn(base, "bg-[var(--adpilot-accent)]")}>{badge.count}</span>;
}
