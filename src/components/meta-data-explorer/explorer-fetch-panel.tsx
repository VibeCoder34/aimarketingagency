"use client";

import { useState } from "react";
import {
  META_EXPLORER_OPERATION_LABELS,
  type MetaExplorerOperation,
} from "@/lib/meta/explorer-operations";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "success";
      summary: {
        recordCount: number;
        pagesFetched: number;
        truncated: boolean;
        datePreset?: string;
      };
      data: unknown;
    }
  | { status: "error"; message: string };

export function ExplorerFetchPanel({
  operation,
  adAccountId,
  disabled,
  hint,
}: {
  operation: MetaExplorerOperation;
  adAccountId: string;
  disabled: boolean;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<FetchState>({ status: "idle" });

  async function handleFetch() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/meta/explorer/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation,
          adAccountId: adAccountId || undefined,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        summary?: FetchState extends { status: "success" } ? FetchState["summary"] : never;
        data?: unknown;
        error?: { message: string };
      };

      if (!json.ok || !json.summary) {
        setState({
          status: "error",
          message: json.error?.message ?? "Request failed.",
        });
        setOpen(true);
        return;
      }

      setState({
        status: "success",
        summary: json.summary,
        data: json.data,
      });
      setOpen(true);
    } catch {
      setState({
        status: "error",
        message: "Network error. Please try again.",
      });
      setOpen(true);
    }
  }

  return (
    <section className="rounded-lg border border-dashed border-[var(--adpilot-border)] bg-zinc-50/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{META_EXPLORER_OPERATION_LABELS[operation]}</h3>
          <p className="mt-0.5 font-mono text-xs text-[var(--adpilot-text-muted)]">
            {operation}
            {operation !== "ad_accounts" && adAccountId ? ` · ${adAccountId}` : ""}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-amber-800">{hint}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={disabled || state.status === "loading"}
          onClick={handleFetch}
          className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[var(--adpilot-nav-active-bg)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {state.status === "loading" ? "Fetching…" : "Run fetch"}
        </button>
      </div>

      {state.status === "error" && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {state.message}
        </p>
      )}

      {state.status === "success" && (
        <div className="mt-3 space-y-2 text-sm text-[var(--adpilot-text-muted)]">
          <p>
            <span className="font-medium text-[var(--adpilot-text)]">{state.summary.recordCount}</span>{" "}
            record{state.summary.recordCount === 1 ? "" : "s"} ·{" "}
            <span className="font-medium text-[var(--adpilot-text)]">{state.summary.pagesFetched}</span>{" "}
            page{state.summary.pagesFetched === 1 ? "" : "s"} fetched
            {state.summary.datePreset ? ` · preset ${state.summary.datePreset}` : ""}
            {state.summary.truncated ? " · more pages available (truncated)" : ""}
          </p>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-xs font-medium text-[var(--adpilot-accent)] hover:underline"
          >
            {open ? "Hide" : "Show"} raw JSON
          </button>
          {open && (
            <pre className="max-h-96 overflow-auto rounded border border-[var(--adpilot-border)] bg-white p-3 text-xs leading-relaxed">
              {JSON.stringify(state.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
