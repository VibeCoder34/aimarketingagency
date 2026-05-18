import { MetaDataExplorerPage } from "@/components/meta-data-explorer/meta-data-explorer-page";
import { isMetaConfigured } from "@/lib/meta/env";
import { getMetaDataExplorerPageData } from "@/lib/meta/explorer-queries";

export default async function MetaDataExplorerRoute() {
  const metaConfigured = isMetaConfigured();
  const data = await getMetaDataExplorerPageData(metaConfigured);

  return <MetaDataExplorerPage data={data} />;
}
