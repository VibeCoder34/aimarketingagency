"use client";

import { useState } from "react";
import type { AdAccountsPageData } from "@/lib/meta/queries";
import { MetaConnectionSection } from "@/components/settings/meta-connection-section";
import { AIPageActionsBar } from "@/components/ai-companion/ai-page-actions-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

const TABS = [
  "Meta Connection",
  "Account & Profile",
  "Team Members",
  "AI & Analysis",
  "Report Defaults",
  "Integrations",
  "Danger Zone",
] as const;

export function SettingsPage({ metaConnection }: { metaConnection: AdAccountsPageData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Meta Connection");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <nav className="w-52 shrink-0 border-r border-[var(--adpilot-border)] bg-[var(--adpilot-surface)] p-4">
        <ul className="space-y-1">
          {TABS.map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => setTab(t)}
                className={`w-full rounded-[var(--adpilot-radius-item)] px-2 py-2 text-left text-sm ${
                  tab === t
                    ? "bg-[var(--adpilot-nav-active-bg)] font-semibold"
                    : "text-[var(--adpilot-text-muted)] hover:bg-[var(--adpilot-nav-hover-bg)]"
                }`}
              >
                {t}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex-1 space-y-4 p-6">
        <AIPageActionsBar
          actions={[
            { actionId: "st-explain", label: "Explain AI settings" },
            { actionId: "st-threshold", label: "Recommend thresholds" },
            { actionId: "st-integrations", label: "Summarize integrations" },
          ]}
        />
        {tab === "Meta Connection" && <MetaConnectionSection data={metaConnection} />}
        {tab === "Account & Profile" && <ProfileSection />}
        {tab === "Team Members" && <TeamSection />}
        {tab === "AI & Analysis" && <AiPrefsSection />}
        {tab === "Report Defaults" && <ReportDefaultsSection />}
        {tab === "Integrations" && <IntegrationsSection />}
        {tab === "Danger Zone" && (
          <DangerZoneSection onConfirm={(a) => setConfirmAction(a)} />
        )}
      </div>
      <Modal
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title="Confirm action"
      >
        <p className="text-sm text-[var(--adpilot-text-muted)]">
          Are you sure you want to {confirmAction}? This cannot be undone.
        </p>
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="destructive" onClick={() => setConfirmAction(null)}>
            Confirm
          </Button>
          <Button type="button" variant="secondary" onClick={() => setConfirmAction(null)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ProfileSection() {
  return (
    <Card title="Account & Profile">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-[var(--adpilot-text-muted)]">Name</dt>
          <dd className="font-medium">Alex Morgan</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--adpilot-text-muted)]">Email</dt>
          <dd className="font-medium">alex@northwindmedia.com</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--adpilot-text-muted)]">Role</dt>
          <dd className="font-medium">Admin</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-[var(--adpilot-text-muted)]">Company</dt>
          <dd className="font-medium">Northwind Media</dd>
        </div>
      </dl>
      <Button type="button" variant="secondary" className="mt-4">
        Edit profile
      </Button>
    </Card>
  );
}

function TeamSection() {
  const members = [
    { name: "Alex Morgan", email: "alex@northwindmedia.com", role: "Admin", status: "Active", actions: "—" },
    { name: "Jamie Lee", email: "jamie@northwindmedia.com", role: "Member", status: "Active", actions: "Remove" },
    { name: "Chris Park", email: "chris@northwindmedia.com", role: "Member", status: "Invited", actions: "Resend / Cancel" },
  ];
  return (
    <Card title="Team Members">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
            <th className="py-2 pr-3">Name</th>
            <th className="py-2 pr-3">Email</th>
            <th className="py-2 pr-3">Role</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.email} className="border-b border-[var(--adpilot-border)] last:border-0">
              <td className="py-2 pr-3 font-medium">{m.name}</td>
              <td className="py-2 pr-3">{m.email}</td>
              <td className="py-2 pr-3">{m.role}</td>
              <td className="py-2 pr-3">{m.status}</td>
              <td className="py-2 text-[var(--adpilot-accent)]">{m.actions}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button type="button" variant="primary" className="mt-4">
        Invite new member
      </Button>
    </Card>
  );
}

function AiPrefsSection() {
  return (
    <Card title="AI & Analysis Preferences">
      <form className="space-y-4 text-sm">
        <label className="block">
          ROAS threshold for recommendations
          <input type="text" defaultValue="3.0" className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2" />
        </label>
        <label className="block">
          Creative fatigue trigger (frequency)
          <input type="text" defaultValue="4.0" className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2" />
        </label>
        <label className="block">
          CTR decline alert threshold
          <input type="text" defaultValue="-30%" className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2" />
        </label>
        <fieldset>
          <legend>Budget pacing sensitivity</legend>
          {["Conservative", "Balanced", "Aggressive"].map((o, i) => (
            <label key={o} className="mr-4">
              <input type="radio" name="pacing" defaultChecked={i === 1} /> {o}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Re-analyze frequency</legend>
          {["Every 6h", "Every 12h", "Every 24h"].map((o, i) => (
            <label key={o} className="mr-4">
              <input type="radio" name="freq" defaultChecked={i === 2} /> {o}
            </label>
          ))}
        </fieldset>
        <Button type="button" variant="primary">
          Save preferences
        </Button>
      </form>
    </Card>
  );
}

function ReportDefaultsSection() {
  return (
    <Card title="Report Defaults">
      <form className="space-y-4 text-sm">
        <fieldset>
          <legend>Default export format</legend>
          {["PDF", "Slides", "Both"].map((o, i) => (
            <label key={o} className="mr-4">
              <input type="radio" name="fmt" defaultChecked={i === 0} /> {o}
            </label>
          ))}
        </fieldset>
        <input type="text" placeholder="Company name" className="w-full rounded border border-[var(--adpilot-border)] p-2" />
        <Button type="button" variant="secondary">
          Upload logo
        </Button>
        <input type="text" placeholder="Brand color" className="w-full rounded border border-[var(--adpilot-border)] p-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Auto-send reports
        </label>
        <input type="text" placeholder="Email list" className="w-full rounded border border-[var(--adpilot-border)] p-2" />
      </form>
    </Card>
  );
}

function IntegrationsSection() {
  const items = [
    {
      name: "Meta Ads",
      status: "Configure in Ad Accounts",
      desc: "Read-only ads_read connection for reporting",
      action: "Open Ad Accounts",
      href: "/ad-accounts",
    },
    { name: "Higgsfield AI", status: "Connected", desc: "Used for creative generation", action: "Manage" },
    { name: "Slack", status: "Not connected", desc: "Connect for alert notifications", action: "Connect" },
    { name: "Google Drive", status: "Not connected", desc: "Auto-save reports to Drive", action: "Connect" },
    { name: "Zapier", status: "Not connected", desc: "Automate workflows", action: "Connect" },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Card key={item.name} title={item.name}>
          <p className="text-sm">{item.status === "Connected" ? "Connected" : item.status}</p>
          <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">{item.desc}</p>
          {"href" in item && item.href ? (
            <a
              href={item.href}
              className="mt-3 inline-flex rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] px-3 py-2 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)]"
            >
              {item.action}
            </a>
          ) : (
            <Button type="button" variant="secondary" className="mt-3">
              {item.action}
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

function DangerZoneSection({ onConfirm }: { onConfirm: (action: string) => void }) {
  return (
    <Card title="Danger Zone">
      <p className="text-sm text-[var(--adpilot-text-muted)]">Irreversible actions for this workspace.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="destructive" onClick={() => onConfirm("clear all data")}>
          Clear all data
        </Button>
        <Button type="button" variant="destructive" onClick={() => onConfirm("delete your account")}>
          Delete account
        </Button>
      </div>
    </Card>
  );
}
