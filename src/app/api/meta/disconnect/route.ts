import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { disconnectMetaConnection } from "@/lib/meta/disconnect";
function redirectBack(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function POST(request: Request) {
  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    return redirectBack(request, "/ad-accounts?meta=error&reason=forbidden");
  }

  try {
    await disconnectMetaConnection(auth.ctx);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Disconnect failed";
    console.error("[meta/disconnect]", message);
    return redirectBack(request, "/ad-accounts?meta=error&reason=connection_failed");
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("return_to");
  const safeReturn =
    returnTo === "/settings" || returnTo === "/ad-accounts" ? returnTo : "/ad-accounts";

  return redirectBack(request, `${safeReturn}?meta=disconnected`);
}
