import { SettingsPage } from "@/components/settings/settings-page";
import { isMetaConfigured } from "@/lib/meta/env";
import { getAdAccountsPageData } from "@/lib/meta/queries";

export default async function SettingsRoute({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section } = await searchParams;
  const metaConfigured = isMetaConfigured();
  const metaConnection = await getAdAccountsPageData(metaConfigured);

  return <SettingsPage metaConnection={metaConnection} initialSection={section} />;
}
