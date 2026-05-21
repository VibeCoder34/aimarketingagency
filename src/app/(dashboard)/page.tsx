import { OverviewDashboard } from "@/components/overview/overview-dashboard";
import { MetaProductGate } from "@/components/meta/meta-product-gate";
import { resolveOverviewForPage } from "@/lib/data/resolve-overview-data";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const metaConnection = await getAdAccountsPageData(isMetaConfigured());
  const data = await resolveOverviewForPage(metaConnection, range);

  return (
    <MetaProductGate metaConnection={metaConnection} source={data.source}>
      <OverviewDashboard
        data={data}
        metaAccounts={metaConnection.accounts}
        showMetaAccountPicker={data.source === "meta" && metaConnection.accounts.length > 0}
      />
    </MetaProductGate>
  );
}
