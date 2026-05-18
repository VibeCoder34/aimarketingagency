import { Suspense } from "react";
import { AdAccountsPage } from "@/components/ad-accounts/ad-accounts-page";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export default async function AdAccountsRoute() {
  const metaConfigured = isMetaConfigured();
  const data = await getAdAccountsPageData(metaConfigured);

  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-[var(--adpilot-text-muted)]">Loading…</div>
      }
    >
      <AdAccountsPage data={data} />
    </Suspense>
  );
}
