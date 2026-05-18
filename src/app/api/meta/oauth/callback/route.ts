import { NextResponse } from "next/server";
import { requireMetaConnectAuth } from "@/lib/meta/auth";
import { persistMetaConnection } from "@/lib/meta/connect";
import { MetaConfigError, getMetaEnvConfig } from "@/lib/meta/env";
import {
  exchangeCodeForAccessToken,
  exchangeForLongLivedToken,
} from "@/lib/meta/graph-client";
import { metaOAuthRedirectPath, type MetaOAuthErrorReason } from "@/lib/meta/errors";
import {
  clearMetaOAuthCookies,
  readMetaOAuthCookies,
} from "@/lib/meta/oauth-cookies";

function redirect(request: Request, reason?: MetaOAuthErrorReason, success = false) {
  return NextResponse.redirect(new URL(metaOAuthRedirectPath(reason, success), request.url));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");

  if (error === "access_denied" || errorReason === "user_denied") {
    await clearMetaOAuthCookies();
    return redirect(request, "permission_denied");
  }

  if (error) {
    console.error("[meta/oauth/callback] Meta OAuth error param:", error, errorReason);
    await clearMetaOAuthCookies();
    return redirect(request, "connection_failed");
  }

  const auth = await requireMetaConnectAuth();
  if (!auth.ok) {
    await clearMetaOAuthCookies();
    const reason: MetaOAuthErrorReason =
      auth.reason === "unauthorized" ? "unauthorized" : "forbidden";
    return redirect(request, reason);
  }

  const cookies = await readMetaOAuthCookies();
  await clearMetaOAuthCookies();

  if (!code || !state || !cookies.state || !cookies.organizationId) {
    console.error("[meta/oauth/callback] Missing code, state, or cookies");
    return redirect(request, "invalid_state");
  }

  if (state !== cookies.state) {
    console.error("[meta/oauth/callback] OAuth state mismatch");
    return redirect(request, "invalid_state");
  }

  if (cookies.organizationId !== auth.ctx.organizationId) {
    console.error("[meta/oauth/callback] Organization mismatch on OAuth callback");
    return redirect(request, "invalid_state");
  }

  let config;
  try {
    config = getMetaEnvConfig();
  } catch (err) {
    const message = err instanceof MetaConfigError ? err.message : "Meta config error";
    console.error("[meta/oauth/callback]", message);
    return redirect(request, "config");
  }

  try {
    const shortLived = await exchangeCodeForAccessToken(config, code);
    const longLived = await exchangeForLongLivedToken(config, shortLived.access_token);
    await persistMetaConnection(
      config,
      auth.ctx,
      longLived.access_token,
      longLived.expires_in,
    );
    return redirect(request, undefined, true);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "NO_AD_ACCOUNTS") {
      return redirect(request, "no_accounts");
    }
    if (message.includes("token exchange") || message.includes("long-lived")) {
      console.error("[meta/oauth/callback] Token exchange failed");
      return redirect(request, "token_exchange");
    }
    console.error("[meta/oauth/callback] Connection failed:", message);
    return redirect(request, "connection_failed");
  }
}
