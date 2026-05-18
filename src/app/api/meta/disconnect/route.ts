import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { disconnectMetaConnection } from "@/lib/meta/disconnect";
function redirectBack(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function POST(request: Request) {
  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    return redirectBack(request, "/settings?section=integrations&meta=error&reason=forbidden");
  }

  try {
    await disconnectMetaConnection(auth.ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Disconnect failed";
    console.error("[meta/disconnect]", message);
    return redirectBack(request, "/settings?section=integrations&meta=error&reason=connection_failed");
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("return_to");
  const safeReturn =
    returnTo === "/settings" || returnTo === "/ad-accounts"
      ? returnTo
      : "/settings?section=integrations";

  const separator = safeReturn.includes("?") ? "&" : "?";
  return redirectBack(request, `${safeReturn}${separator}meta=disconnected`);
}
