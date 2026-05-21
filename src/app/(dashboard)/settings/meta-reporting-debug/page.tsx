import { MetaReportingDebugPage } from "@/components/meta-reporting-debug/meta-reporting-debug-page";
import { isMetaConfigured } from "@/lib/meta/env";
import { getReportingDebugPageData } from "@/lib/meta/reporting-debug";

export default async function MetaReportingDebugRoute() {
  const data = await getReportingDebugPageData(isMetaConfigured());
  return <MetaReportingDebugPage data={data} />;
}
