/** Warn users this many days before token_expires_at. */
export const META_TOKEN_EXPIRES_SOON_DAYS = 7;

/**
 * Meta long-lived user access tokens are valid for about 60 days when obtained via
 * fb_exchange_token. Used only when Meta omits expires_in on the exchange response.
 * @see https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
 */
export const META_LONG_LIVED_TOKEN_DEFAULT_SECONDS = 60 * 24 * 60 * 60;

export function resolveTokenExpiresAt(expiresInSeconds?: number): string {
  const seconds =
    expiresInSeconds != null && expiresInSeconds > 0
      ? expiresInSeconds
      : META_LONG_LIVED_TOKEN_DEFAULT_SECONDS;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export function expiresSoonThresholdMs(): number {
  return META_TOKEN_EXPIRES_SOON_DAYS * 24 * 60 * 60 * 1000;
}
