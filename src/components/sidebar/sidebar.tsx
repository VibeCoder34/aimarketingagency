"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  ChartLine,
  FileBarChart,
  Image as ImageIcon,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { SidebarItem } from "@/components/sidebar/sidebar-item";
import type { NavIconId, NavItem, NavSection } from "@/types";

const NAV_ICONS: Record<NavIconId, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  target: Target,
  "building-2": Building2,
  sparkles: Sparkles,
  photo: ImageIcon,
  "file-analytics": FileBarChart,
  "chart-line": ChartLine,
  bell: Bell,
  settings: Settings,
};

export type SidebarUser = {
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
};

export type SidebarProps = {
  sections: NavSection[];
  user: SidebarUser;
};

function NavSectionBlock({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="px-3 pt-6 first:pt-5">
      <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--adpilot-text-muted)]">
        {title}
      </p>
      <nav className="flex flex-col gap-0.5" aria-label={title}>
        {items.map((item) => (
          <SidebarItem key={item.href} item={item} pathname={pathname} Icon={NAV_ICONS[item.icon]} />
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ sections, user }: SidebarProps) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-[var(--adpilot-border)] bg-[var(--adpilot-surface)]">
      <div className="flex items-center gap-2 px-4 py-5">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--adpilot-accent)]" aria-hidden />
        <span className="text-lg font-semibold tracking-tight text-[var(--adpilot-text-primary)]">AdPilot</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {sections.map((section) => (
          <NavSectionBlock key={section.title} title={section.title} items={section.items} pathname={pathname} />
        ))}
      </div>

      <div className="border-t border-[var(--adpilot-border)] p-3">
        <div className="flex items-center gap-3 rounded-[var(--adpilot-radius-item)] px-1 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--adpilot-nav-active-bg)] text-xs font-semibold text-[var(--adpilot-text-primary)]">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden>{user.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--adpilot-text-primary)]">{user.name}</p>
            {user.email ? (
              <p className="truncate text-xs text-[var(--adpilot-text-muted)]">{user.email}</p>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-[var(--adpilot-radius-item)] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-100 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} aria-hidden />
          ) : (
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          )}
          Çıkış yap
        </button>
      </div>
    </aside>
  );
}
