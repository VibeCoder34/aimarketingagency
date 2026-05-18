"use client";

import { useMemo, useState } from "react";
import { MOCK_ALERTS, MOCK_ALERT_SUMMARY } from "@/lib/mock/alerts.mock";
import { AIInlineActionButton } from "@/components/ai-companion/ai-inline-action-button";
import { PageActions } from "@/components/pages/page-actions";
import { FilterChips } from "@/components/ui/filter-chips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { AlertFeedItem, AlertSeverity } from "@/types";

const SEVERITY_VARIANT: Record<AlertSeverity, "danger" | "warning" | "default" | "muted"> = {
  urgent: "danger",
  high: "warning",
  medium: "default",
  low: "muted",
};

export function AlertsPage() {
  const [tab, setTab] = useState("All");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      const isRead = readIds.has(a.id) || a.isRead;
      const isResolved = resolvedIds.has(a.id) || a.isResolved;
      if (tab === "Unread") return !isRead;
      if (tab === "Resolved") return isResolved;
      if (tab === "Urgent" || tab === "High" || tab === "Medium" || tab === "Low") {
        return a.severity === tab.toLowerCase();
      }
      return !isResolved || tab === "All";
    });
  }, [tab, readIds, resolvedIds]);

  return (
    <>
      <PageActions
        showExport={false}
        showDateRange={false}
        primaryAction={{ label: "Notification Settings", onClick: () => setSettingsOpen(true), variant: "secondary" }}
      />
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Urgent", value: MOCK_ALERT_SUMMARY.urgent },
            { label: "High", value: MOCK_ALERT_SUMMARY.high },
            { label: "Medium", value: MOCK_ALERT_SUMMARY.medium },
            { label: "Total Active", value: MOCK_ALERT_SUMMARY.total },
          ].map((s) => (
            <div key={s.label} className="rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4">
              <p className="text-2xl font-semibold">{s.value}</p>
              <p className="text-xs text-[var(--adpilot-text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        <FilterChips
          options={["All", "Unread", "Urgent", "High", "Medium", "Low", "Resolved"]}
          value={tab}
          onChange={setTab}
        />

        <ul className="space-y-3">
          {visible.map((alert) => (
            <AlertRow
              key={alert.id}
              alert={alert}
              onRead={() => setReadIds((s) => new Set(s).add(alert.id))}
              onResolve={() => setResolvedIds((s) => new Set(s).add(alert.id))}
            />
          ))}
        </ul>
      </div>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Notification Settings" wide>
        <NotificationSettingsForm />
      </Modal>
    </>
  );
}

function AlertRow({
  alert,
  onRead,
  onResolve,
}: {
  alert: AlertFeedItem;
  onRead: () => void;
  onResolve: () => void;
}) {
  return (
    <li className="flex flex-wrap items-start gap-3 rounded-[var(--adpilot-radius-card)] border border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4">
      <span className="text-lg" aria-hidden>
        {alert.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={SEVERITY_VARIANT[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
          <span className="text-xs text-[var(--adpilot-text-muted)]">{alert.title}</span>
        </div>
        <p className="mt-1 text-sm text-[var(--adpilot-text-muted)]">{alert.description}</p>
        <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">
          {alert.campaignName} · {alert.timeAgo}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <AIInlineActionButton actionId="al-explain" label="Explain with AI" variant="ghost" className="!text-[10px]" />
        <AIInlineActionButton actionId="al-fix" label="Create fix plan" variant="secondary" className="!text-[10px]" />
        <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs" onClick={onRead}>
          Mark as Read
        </Button>
        <Button type="button" variant="secondary" className="!px-2 !py-1 text-xs" onClick={onResolve}>
          Resolve
        </Button>
      </div>
    </li>
  );
}

function NotificationSettingsForm() {
  return (
    <form className="space-y-4 text-sm" onSubmit={(e) => e.preventDefault()}>
      <label className="flex items-center gap-2">
        <input type="checkbox" defaultChecked /> Email notifications
      </label>
      <input type="email" defaultValue="alex@northwindmedia.com" className="w-full rounded border border-[var(--adpilot-border)] p-2" />
      <label className="flex items-center gap-2">
        <input type="checkbox" /> Slack webhook
      </label>
      <input type="url" placeholder="https://hooks.slack.com/..." className="w-full rounded border border-[var(--adpilot-border)] p-2" />
      <fieldset className="space-y-2">
        <legend className="font-medium">Alert thresholds</legend>
        <label className="flex justify-between gap-2">
          ROAS drops below
          <input type="text" defaultValue="3.0" className="w-20 rounded border border-[var(--adpilot-border)] px-2" /> x
        </label>
        <label className="flex justify-between gap-2">
          CPC increases by more than
          <input type="text" defaultValue="30" className="w-20 rounded border border-[var(--adpilot-border)] px-2" /> %
        </label>
        <label className="flex justify-between gap-2">
          CTR drops below
          <input type="text" defaultValue="1.5" className="w-20 rounded border border-[var(--adpilot-border)] px-2" /> %
        </label>
        <label className="flex justify-between gap-2">
          Creative frequency above
          <input type="text" defaultValue="4.0" className="w-20 rounded border border-[var(--adpilot-border)] px-2" />
        </label>
        <label className="flex justify-between gap-2">
          Budget pacing ahead by more than
          <input type="text" defaultValue="15" className="w-20 rounded border border-[var(--adpilot-border)] px-2" /> %
        </label>
      </fieldset>
      <label className="block">
        Notification frequency
        <select className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2">
          <option>Immediately</option>
          <option>Daily digest</option>
          <option>Weekly digest</option>
        </select>
      </label>
      <Button type="submit" variant="primary">
        Save settings
      </Button>
    </form>
  );
}
