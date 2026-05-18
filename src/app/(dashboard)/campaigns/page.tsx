import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { defaultOverviewParams, getCampaignsData } from "@/lib/data/get-dashboard-data";

export default function CampaignsPage() {
  const data = getCampaignsData(defaultOverviewParams());

  return <CampaignsTable data={data} />;
}
