import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { MetaExplorerError, toSafeExplorerErrorResponse } from "@/lib/meta/explorer-errors";
import { runMetaReportingSync } from "@/lib/meta/sync/orchestrator";
import type { MetaReportingSyncType } from "@/lib/meta/sync/types";
import { META_REPORTING_SYNC_JOBS } from "@/lib/meta/sync/types";

type ReportingSyncBody = {
  adAccountId?: string;
  datePreset?: string;
  jobs?: string[];
  includeOverview?: boolean;
};

function parseJobs(input?: string[]): MetaReportingSyncType[] | undefined {
  if (!input?.length) return undefined;
  const allowed = new Set(META_REPORTING_SYNC_JOBS);
  const jobs = input.filter((j): j is MetaReportingSyncType => allowed.has(j as MetaReportingSyncType));
  return jobs.length > 0 ? jobs : undefined;
}

export async function POST(request: Request) {
  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    const code = auth.reason === "unauthorized" ? "UNAUTHORIZED" : "FORBIDDEN";
    const message =
      auth.reason === "unauthorized"
        ? "Please sign in to run Meta reporting sync."
        : "Only organization owners and admins can run Meta reporting sync.";
    return NextResponse.json(
      { ok: false, error: { code, message } },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  let body: ReportingSyncBody = {};
  try {
    const text = await request.text();
    if (text) body = JSON.parse(text) as ReportingSyncBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_REQUEST", message: "Invalid request body." } },
      { status: 400 },
    );
  }

  try {
    const result = await runMetaReportingSync(auth.ctx, {
      adAccountId: body.adAccountId,
      datePreset: body.datePreset,
      jobs: parseJobs(body.jobs),
      includeOverview: body.includeOverview,
    });

    if (result.ok) {
      revalidatePath("/");
      revalidatePath("/dashboard");
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 207 });
  } catch (err) {
    const safe = toSafeExplorerErrorResponse(err);
    const status =
      err instanceof MetaExplorerError
        ? err.code === "RATE_LIMITED"
          ? 429
          : err.code === "TOKEN_EXPIRED"
            ? 401
            : 400
        : 500;

    if (!(err instanceof MetaExplorerError)) {
      console.error("[meta/sync/reporting] unexpected error");
    }

    return NextResponse.json(safe, { status });
  }
}
