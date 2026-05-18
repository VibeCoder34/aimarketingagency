"use client";

import { usePathname } from "next/navigation";
import {
  AICompanionProvider,
  AICompanionSidebar,
  AICompanionTrigger,
} from "@/components/ai-companion";
import { Sidebar } from "@/components/sidebar/sidebar";
import { PageToolbarProvider } from "@/components/layout/page-toolbar-context";
import { EmailVerificationGuard } from "@/components/auth/email-verification-guard";
import { Topbar } from "@/components/topbar/topbar";
import type { NavSection } from "@/types";
import type { SidebarUser } from "@/components/sidebar/sidebar";

export type SidebarLayoutProps = {
  children: React.ReactNode;
  sections: NavSection[];
  user: SidebarUser;
  agencyName: string;
  pageTitle?: string;
  routeTitles?: Record<string, string>;
};

function resolvePageTitle(
  pathname: string,
  pageTitle: string | undefined,
  routeTitles: Record<string, string> | undefined,
): string {
  if (pageTitle) return pageTitle;
  if (/^\/campaigns\/.+/.test(pathname)) return "Campaign detail";
  if (routeTitles?.[pathname]) return routeTitles[pathname]!;

  const prefixes = routeTitles
    ? Object.keys(routeTitles)
        .filter((k) => k !== "/")
        .sort((a, b) => b.length - a.length)
    : [];

  for (const key of prefixes) {
    if (pathname === key || pathname.startsWith(`${key}/`)) {
      return routeTitles![key]!;
    }
  }

  if (pathname === "/") return "Overview";
  const segment = pathname.split("/").filter(Boolean)[0] ?? "";
  if (!segment) return "AdPilot";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

export function SidebarLayout({
  children,
  sections,
  user,
  agencyName,
  pageTitle,
  routeTitles,
}: SidebarLayoutProps) {
  const pathname = usePathname() ?? "/";
  const title = resolvePageTitle(pathname, pageTitle, routeTitles);

  return (
    <AICompanionProvider>
      <PageToolbarProvider>
        <div className="min-h-screen bg-[var(--adpilot-bg-main)]">
          <Sidebar sections={sections} user={user} />
          <div className="flex min-h-screen flex-1 flex-col pl-[220px]">
            <Topbar title={title} agencyName={agencyName} />
            <EmailVerificationGuard>
              <main className="flex-1 overflow-auto">{children}</main>
            </EmailVerificationGuard>
          </div>
          <AICompanionTrigger />
          <AICompanionSidebar />
        </div>
      </PageToolbarProvider>
    </AICompanionProvider>
  );
}
