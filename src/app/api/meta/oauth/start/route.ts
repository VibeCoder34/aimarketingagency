import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { MetaConfigError, getMetaEnvConfig } from "@/lib/meta/env";
import { buildMetaOAuthAuthorizeUrl } from "@/lib/meta/graph-client";
import { metaOAuthRedirectPath } from "@/lib/meta/errors";
import { setMetaOAuthCookies } from "@/lib/meta/oauth-cookies";

export async function GET(request: Request) {
  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    const reason =
      auth.reason === "unauthorized"
        ? "unauthorized"
        : auth.reason === "forbidden"
          ? "forbidden"
          : "connection_failed";
    return NextResponse.redirect(new URL(metaOAuthRedirectPath(reason), request.url));
  }

  let config;
  try {
    config = getMetaEnvConfig();
  } catch (err) {
    const message = err instanceof MetaConfigError ? err.message : "Meta config error";
    console.error("[meta/oauth/start]", message);
    return NextResponse.redirect(new URL(metaOAuthRedirectPath("config"), request.url));
  }

  const state = randomBytes(32).toString("hex");
  const secure = new URL(request.url).protocol === "https:";

  await setMetaOAuthCookies(state, auth.ctx.organizationId, { secure });

  const authorizeUrl = buildMetaOAuthAuthorizeUrl(config, state);
  return NextResponse.redirect(authorizeUrl);
}
