"use client";

import { useState } from "react";
import {
  MOCK_PAST_REPORTS,
  MOCK_REPORT_METRICS,
  MOCK_REPORT_TEMPLATES,
  MOCK_REPORT_TYPES,
} from "@/lib/mock/reports.mock";
import { AIPageActionsBar } from "@/components/ai-companion/ai-page-actions-bar";
import { AIGeneratedOutputCard } from "@/components/ai-companion/ai-generated-output-card";
import { useAICompanion } from "@/components/ai-companion/ai-companion-context";
import { PageActions } from "@/components/pages/page-actions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ReportsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { outputs } = useAICompanion();
  const reportOutput = outputs.find((o) => o.type === "report");

  return (
    <>
      <PageActions
        showExport={false}
        showDateRange={false}
        primaryAction={{ label: "Create New Report", onClick: () => setCreateOpen(true), variant: "primary" }}
      />
      <div className="space-y-6 p-6">
        <AIPageActionsBar
          actions={[
            { actionId: "rp-weekly", label: "Generate report" },
            { actionId: "rp-friendly", label: "Rewrite for client" },
            { actionId: "rp-recs", label: "Add recommendations" },
            { actionId: "rp-exec", label: "Make shorter" },
          ]}
        />

        {reportOutput ? (
          <AIGeneratedOutputCard output={reportOutput} actionState={reportOutput.actionState} />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {MOCK_REPORT_TEMPLATES.map((tpl) => (
            <Card key={tpl.id} title={tpl.name}>
              <p className="text-xs text-[var(--adpilot-text-muted)]">Last generated: {tpl.lastGenerated}</p>
              <p className="text-xs text-[var(--adpilot-text-muted)]">Auto-send: {tpl.autoSend}</p>
              <p className="text-xs text-[var(--adpilot-text-muted)]">Format: {tpl.format}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" className="!px-2 !py-1 text-xs">
                  Download
                </Button>
                <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs">
                  Edit
                </Button>
                <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs">
                  Send Now
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card title="Past reports">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--adpilot-border)] text-xs uppercase text-[var(--adpilot-text-muted)]">
                  <th className="py-2 pr-3">Report Name</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Date Generated</th>
                  <th className="py-2 pr-3">Period Covered</th>
                  <th className="py-2 pr-3">Format</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PAST_REPORTS.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--adpilot-border)] last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.name}</td>
                    <td className="py-2 pr-3 capitalize">{r.type}</td>
                    <td className="py-2 pr-3">{r.dateGenerated}</td>
                    <td className="py-2 pr-3">{r.periodCovered}</td>
                    <td className="py-2 pr-3">{r.format}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={r.status === "sent" ? "success" : "muted"}>
                        {r.status === "sent" ? "Sent" : "Downloaded"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs">
                          Download
                        </Button>
                        <Button type="button" variant="ghost" className="!px-2 !py-1 text-xs">
                          Duplicate
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card
          title="Preview — Weekly Performance Summary"
          className={reportOutput ? "ring-1 ring-[var(--adpilot-accent)]/30" : undefined}
        >
          <div className="rounded-lg border border-dashed border-[var(--adpilot-border)] bg-[var(--adpilot-bg-main)] p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-[var(--adpilot-border)]" />
              <div>
                <p className="text-sm font-semibold">Northwind Media</p>
                <p className="text-xs text-[var(--adpilot-text-muted)]">Weekly Performance · May 6–13, 2026</p>
              </div>
            </div>
            <div className="mb-4 h-24 rounded bg-[var(--adpilot-border)]/50" />
            <div className="mb-4 grid grid-cols-4 gap-2">
              {["Spend", "Revenue", "ROAS", "Clicks"].map((m) => (
                <div key={m} className="rounded border border-[var(--adpilot-border)] p-2 text-center text-xs">
                  <p className="text-[var(--adpilot-text-muted)]">{m}</p>
                  <p className="font-semibold">—</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-[var(--adpilot-text-primary)]">AI Summary</p>
            <p className="mt-1 text-xs text-[var(--adpilot-text-muted)]">
              Performance remained strong with blended ROAS at 3.42x. Summer Sale campaign led revenue contribution...
            </p>
          </div>
        </Card>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create New Report" wide>
        <form className="space-y-4 text-sm" onSubmit={(e) => e.preventDefault()}>
          <label className="block">
            Report name
            <input type="text" className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2" />
          </label>
          <label className="block">
            Report type
            <select className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2">
              {MOCK_REPORT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Date range
            <input type="text" defaultValue="May 1 – May 13, 2026" className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2" />
          </label>
          <fieldset>
            <legend className="text-[var(--adpilot-text-muted)]">Metrics to include</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {MOCK_REPORT_METRICS.map((m) => (
                <label key={m.id} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            Include AI-written performance summary
          </label>
          <fieldset className="space-y-2">
            <legend className="text-[var(--adpilot-text-muted)]">White-label</legend>
            <input type="text" placeholder="Client company name" className="w-full rounded border border-[var(--adpilot-border)] p-2" />
            <input type="text" placeholder="Brand color (#hex)" className="w-full rounded border border-[var(--adpilot-border)] p-2" />
            <Button type="button" variant="secondary">
              Upload client logo
            </Button>
          </fieldset>
          <label className="block">
            Export format
            <select className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2">
              <option>PDF</option>
              <option>Google Slides</option>
              <option>Both</option>
            </select>
          </label>
          <label className="block">
            Schedule
            <select className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2">
              <option>One-time</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </label>
          <label className="block">
            Auto-send to email
            <input type="email" placeholder="client@example.com" className="mt-1 w-full rounded border border-[var(--adpilot-border)] p-2" />
          </label>
          <Button type="submit" variant="primary" className="w-full">
            Generate Report
          </Button>
        </form>
      </Modal>
    </>
  );
}
