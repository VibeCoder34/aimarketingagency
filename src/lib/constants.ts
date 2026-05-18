import type { NavSection } from "@/types";

export const DEFAULT_AGENCY_NAME = "Northwind Media";

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Overview", href: "/", icon: "layout-dashboard" },
      { label: "Campaigns", href: "/campaigns", icon: "target" },
      { label: "Ad Accounts", href: "/ad-accounts", icon: "building-2" },
      { label: "Recommendations", href: "/ai-insights", icon: "sparkles" },
    ],
  },
  {
    title: "Create",
    items: [
      { label: "Creatives", href: "/creatives", icon: "photo" },
      { label: "Reports", href: "/reports", icon: "file-analytics" },
    ],
  },
  {
    title: "Analytics",
    items: [{ label: "Analytics", href: "/analytics", icon: "chart-line" }],
  },
  {
    title: "Account",
    items: [
      { label: "Alerts", href: "/alerts", icon: "bell", badge: { variant: "danger", count: 3 } },
      { label: "Settings", href: "/settings", icon: "settings" },
    ],
  },
];

export const ROUTE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/campaigns": "Campaigns",
  "/ad-accounts": "Ad Accounts",
  "/ad-accounts/meta-data-explorer": "Meta Data Explorer",
  "/ai-insights": "Recommendations",
  "/recommendations": "Recommendations",
  "/creatives": "Creatives",
  "/reports": "Reports",
  "/analytics": "Analytics",
  "/alerts": "Alerts",
  "/settings": "Settings",
  "/login": "Sign in",
};
