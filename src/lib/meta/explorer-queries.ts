import { getAdAccountsPageData, type AdAccountsPageData } from "@/lib/meta/queries";

export type MetaDataExplorerPageData = AdAccountsPageData & {
  canUseExplorer: boolean;
};

export async function getMetaDataExplorerPageData(
  metaConfigured: boolean,
): Promise<MetaDataExplorerPageData> {
  const base = await getAdAccountsPageData(metaConfigured);
  return {
    ...base,
    canUseExplorer: base.canConnect,
  };
}
