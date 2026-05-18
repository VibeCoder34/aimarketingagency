import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { MetaProductGate } from "@/components/meta/meta-product-gate";
import { defaultOverviewParams, getCampaignsData } from "@/lib/data/get-dashboard-data";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export default async function CampaignsPage() {
  const params = defaultOverviewParams();
  const data = getCampaignsData(params);
  const metaConnection = await getAdAccountsPageData(isMetaConfigured());

  return (
    <MetaProductGate metaConnection={metaConnection} source={params.source}>
      <CampaignsTable data={data} />
    </MetaProductGate>
  );
}
