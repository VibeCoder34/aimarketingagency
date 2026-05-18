"use client";

import { Suspense } from "react";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import { MetaFlashBanner } from "@/components/meta/meta-flash-banner";
import { MetaIntegrationCard } from "@/components/meta/meta-integration-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SettingsIntegrationsPanel({ metaConnection }: { metaConnection: AdAccountsPageData }) {
  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <MetaFlashBanner />
      </Suspense>

      <MetaIntegrationCard data={metaConnection} returnTo="/settings" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Higgsfield AI">
          <p className="text-sm text-[var(--adpilot-text-muted)]">Connected</p>
          <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">Used for creative generation</p>
          <Button type="button" variant="secondary" className="mt-3">
            Manage
          </Button>
        </Card>
        <Card title="Slack">
          <p className="text-sm text-[var(--adpilot-text-muted)]">Not connected</p>
          <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">Connect for alert notifications</p>
          <Button type="button" variant="secondary" className="mt-3">
            Connect
          </Button>
        </Card>
        <Card title="Google Drive">
          <p className="text-sm text-[var(--adpilot-text-muted)]">Not connected</p>
          <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">Auto-save reports to Drive</p>
          <Button type="button" variant="secondary" className="mt-3">
            Connect
          </Button>
        </Card>
        <Card title="Zapier">
          <p className="text-sm text-[var(--adpilot-text-muted)]">Not connected</p>
          <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">Automate workflows</p>
          <Button type="button" variant="secondary" className="mt-3">
            Connect
          </Button>
        </Card>
      </div>
    </div>
  );
}
