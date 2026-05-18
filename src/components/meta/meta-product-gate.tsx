import type { ReactNode } from "react";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import type { DataSourceType } from "@/lib/data/types";
import { shouldShowMetaNotConnectedEmpty } from "@/lib/meta/integration-ui";
import { MetaNotConnectedEmptyState } from "@/components/meta/meta-not-connected-empty-state";

type MetaProductGateProps = {
  metaConnection: AdAccountsPageData;
  source: DataSourceType;
  children: ReactNode;
};

/** Renders children for mock/demo mode; shows connect empty state when live Meta mode is not connected. */
export function MetaProductGate({ metaConnection, source, children }: MetaProductGateProps) {
  if (shouldShowMetaNotConnectedEmpty(metaConnection, source)) {
    return <MetaNotConnectedEmptyState />;
  }

  return <>{children}</>;
}
