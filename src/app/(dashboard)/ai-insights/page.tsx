import { RecommendationsPage } from "@/components/recommendations/recommendations-page";
import { defaultOverviewParams, getRecommendationsData } from "@/lib/data/get-dashboard-data";

export default function AiInsightsRoute() {
  const data = getRecommendationsData(defaultOverviewParams());
  return <RecommendationsPage data={data} />;
}
