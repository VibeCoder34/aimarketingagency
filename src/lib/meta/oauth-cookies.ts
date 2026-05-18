import { cookies } from "next/headers";

export const META_OAUTH_STATE_COOKIE = "meta_oauth_state";
export const META_OAUTH_ORG_COOKIE = "meta_oauth_org";

const COOKIE_MAX_AGE_SECONDS = 600; // 10 minutes

export type MetaOAuthCookieOptions = {
  secure: boolean;
};

function baseCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
}

export async function setMetaOAuthCookies(
  state: string,
  organizationId: string,
  options: MetaOAuthCookieOptions,
): Promise<void> {
  const cookieStore = await cookies();
  const opts = baseCookieOptions(options.secure);
  cookieStore.set(META_OAUTH_STATE_COOKIE, state, opts);
  cookieStore.set(META_OAUTH_ORG_COOKIE, organizationId, opts);
}

export async function readMetaOAuthCookies(): Promise<{
  state: string | undefined;
  organizationId: string | undefined;
}> {
  const cookieStore = await cookies();
  return {
    state: cookieStore.get(META_OAUTH_STATE_COOKIE)?.value,
    organizationId: cookieStore.get(META_OAUTH_ORG_COOKIE)?.value,
  };
}

export async function clearMetaOAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(META_OAUTH_STATE_COOKIE);
  cookieStore.delete(META_OAUTH_ORG_COOKIE);
}
