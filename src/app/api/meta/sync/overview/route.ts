import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { MetaExplorerError, toSafeExplorerErrorResponse } from "@/lib/meta/explorer-errors";
import { runMetaOverviewSync } from "@/lib/meta/overview-sync";

export async function POST(request: Request) {
  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    const code = auth.reason === "unauthorized" ? "UNAUTHORIZED" : "FORBIDDEN";
    const message =
      auth.reason === "unauthorized"
        ? "Please sign in to refresh Meta overview data."
        : "Only organization owners and admins can refresh Meta overview data.";
    return NextResponse.json(
      { ok: false, error: { code, message } },
      { status: auth.reason === "unauthorized" ? 401 : 403 },
    );
  }

  let body: { adAccountId?: string; datePreset?: string } = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text) as { adAccountId?: string; datePreset?: string };
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_REQUEST", message: "Invalid request body." } },
      { status: 400 },
    );
  }

  try {
    const result = await runMetaOverviewSync(auth.ctx, {
      adAccountId: body.adAccountId,
      datePreset: body.datePreset,
    });

    if (result.ok) {
      revalidatePath("/");
      revalidatePath("/dashboard");
      return NextResponse.json(result);
    }

    if ("throttled" in result && result.throttled) {
      return NextResponse.json(result, { status: 429 });
    }

    const status =
      result.error.code === "NO_AD_ACCOUNT_SELECTED" ||
      result.error.code === "CONNECTION_NOT_FOUND"
        ? 400
        : result.error.code === "TOKEN_EXPIRED"
          ? 401
          : result.error.code === "RATE_LIMITED"
            ? 429
            : 400;

    return NextResponse.json(result, { status });
  } catch (err) {
    const safe = toSafeExplorerErrorResponse(err);
    const status =
      err instanceof MetaExplorerError
        ? err.code === "RATE_LIMITED"
          ? 429
          : err.code === "TOKEN_EXPIRED" || err.code === "CONNECTION_NOT_FOUND"
            ? 401
            : 400
        : 500;

    if (!(err instanceof MetaExplorerError)) {
      console.error("[meta/sync/overview] unexpected error");
    }

    return NextResponse.json(safe, { status });
  }
}
