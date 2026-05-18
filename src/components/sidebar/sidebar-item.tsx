import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";
import { SidebarBadge } from "@/components/sidebar/sidebar-badge";

export type SidebarItemProps = {
  item: NavItem;
  pathname: string;
  Icon: LucideIcon;
};

export function SidebarItem({ item, pathname, Icon }: SidebarItemProps) {
  const active =
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-[var(--adpilot-radius-item)] px-2 py-2 text-sm transition-colors duration-150",
        active
          ? "bg-[var(--adpilot-nav-active-bg)] font-semibold text-[var(--adpilot-text-primary)]"
          : "font-normal text-[var(--adpilot-text-primary)] hover:bg-[var(--adpilot-nav-hover-bg)]",
      )}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 text-[var(--adpilot-text-primary)]" strokeWidth={1.75} aria-hidden />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? <SidebarBadge badge={item.badge} /> : null}
    </Link>
  );
}
