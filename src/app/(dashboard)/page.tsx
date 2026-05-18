import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { defaultOverviewParams, getOverviewData } from "@/lib/data/get-dashboard-data";

export default function DashboardOverviewPage() {
  const data = getOverviewData(defaultOverviewParams());

  return <OverviewDashboard data={data} />;
}
