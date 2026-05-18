import { RecommendationsPage } from "@/components/recommendations/recommendations-page";
import { MetaProductGate } from "@/components/meta/meta-product-gate";
import { defaultOverviewParams, getRecommendationsData } from "@/lib/data/get-dashboard-data";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export default async function AiInsightsRoute() {
  const params = defaultOverviewParams();
  const data = getRecommendationsData(params);
  const metaConnection = await getAdAccountsPageData(isMetaConfigured());

  return (
    <MetaProductGate metaConnection={metaConnection} source={params.source}>
      <RecommendationsPage data={data} />
    </MetaProductGate>
  );
}
