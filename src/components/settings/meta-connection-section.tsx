import type { AdAccountsPageData } from "@/lib/meta/queries";
import { MetaIntegrationCard } from "@/components/meta/meta-integration-card";

/** @deprecated Prefer Integrations tab with MetaIntegrationCard */
export function MetaConnectionSection({ data }: { data: AdAccountsPageData }) {
  return <MetaIntegrationCard data={data} returnTo="/settings" />;
}
