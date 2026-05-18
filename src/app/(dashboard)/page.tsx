import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { MetaProductGate } from "@/components/meta/meta-product-gate";
import { defaultOverviewParams, getOverviewData } from "@/lib/data/get-dashboard-data";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export default async function DashboardOverviewPage() {
  const params = defaultOverviewParams();
  const data = getOverviewData(params);
  const metaConnection = await getAdAccountsPageData(isMetaConfigured());

  return (
    <MetaProductGate metaConnection={metaConnection} source={params.source}>
      <OverviewDashboard data={data} />
    </MetaProductGate>
  );
}
