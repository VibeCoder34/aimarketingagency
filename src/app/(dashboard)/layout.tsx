import { SidebarLayout } from "@/components/layout/sidebar-layout";
import { DEFAULT_AGENCY_NAME, NAV_SECTIONS, ROUTE_TITLES } from "@/lib/constants";
import {
  getDashboardUserContext,
  toAgencyName,
  toSidebarUser,
} from "@/lib/supabase/user-context";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ctx = await getDashboardUserContext();

  return (
    <SidebarLayout
      sections={NAV_SECTIONS}
      user={toSidebarUser(ctx, user?.email)}
      agencyName={toAgencyName(ctx, DEFAULT_AGENCY_NAME)}
      routeTitles={ROUTE_TITLES}
    >
      {children}
    </SidebarLayout>
  );
}
