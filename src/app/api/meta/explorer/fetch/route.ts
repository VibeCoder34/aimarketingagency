import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { runMetaExplorerOperation } from "@/lib/meta/explorer-fetch";
import {
  MetaExplorerError,
  toSafeExplorerErrorResponse,
} from "@/lib/meta/explorer-errors";
import {
  isMetaExplorerOperation,
  META_EXPLORER_INSIGHTS_DATE_PRESET,
  operationRequiresAdAccount,
  operationUsesInsightsDatePreset,
} from "@/lib/meta/explorer-operations";
import { assertAdAccountForOrganization, resolveMetaAccessToken } from "@/lib/meta/explorer-token";
import { getMetaEnvConfig, MetaConfigError } from "@/lib/meta/env";

export async function POST(request: Request) {
  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    const code = auth.reason === "unauthorized" ? "UNAUTHORIZED" : "FORBIDDEN";
    const message =
      auth.reason === "unauthorized"
        ? "Please sign in to use the Meta Data Explorer."
        : "Only organization owners and admins can use the Meta Data Explorer.";
    return NextResponse.json(
      { ok: false, error: { code, message } },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  let body: { operation?: string; adAccountId?: string };
  try {
    body = (await request.json()) as { operation?: string; adAccountId?: string };
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_REQUEST", message: "Invalid request body." },
      },
      { status: 400 },
    );
  }

  const operation = body.operation;
  if (!operation || !isMetaExplorerOperation(operation)) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_REQUEST", message: "Unknown explorer operation." },
      },
      { status: 400 },
    );
  }

  try {
    let config;
    try {
      config = getMetaEnvConfig();
    } catch (err) {
      const message = err instanceof MetaConfigError ? err.message : "Meta is not configured.";
      throw new MetaExplorerError("CONFIG_ERROR", message);
    }

    const accessToken = await resolveMetaAccessToken(auth.ctx);

    let actId: string | null = null;
    if (operationRequiresAdAccount(operation)) {
      if (!body.adAccountId) {
        throw new MetaExplorerError("INVALID_REQUEST", "Select an ad account for this request.");
      }
      actId = await assertAdAccountForOrganization(auth.ctx, body.adAccountId);
    }

    const result = await runMetaExplorerOperation(
      config,
      accessToken,
      operation,
      actId,
      auth.ctx.organizationId,
    );

    return NextResponse.json({
      ok: true,
      operation,
      adAccountId: actId,
      summary: {
        recordCount: result.data.length,
        pagesFetched: result.pagesFetched,
        truncated: result.truncated,
        ...(operationUsesInsightsDatePreset(operation)
          ? { datePreset: META_EXPLORER_INSIGHTS_DATE_PRESET }
          : {}),
      },
      data: result.data,
    });
  } catch (err) {
    const safe = toSafeExplorerErrorResponse(err);
    const status =
      err instanceof MetaExplorerError
        ? err.code === "RATE_LIMITED"
          ? 429
          : err.code === "FORBIDDEN" || err.code === "UNAUTHORIZED"
            ? 403
            : err.code === "TOKEN_EXPIRED" || err.code === "CONNECTION_NOT_FOUND"
              ? 401
              : 400
        : 500;

    if (!(err instanceof MetaExplorerError)) {
      console.error("[meta/explorer/fetch] unexpected error");
    }

    return NextResponse.json(safe, { status });
  }
}
