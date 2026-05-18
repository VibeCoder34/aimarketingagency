export type MetaEnvConfig = {
  appId: string;
  appSecret: string;
  redirectUri: string;
  tokenEncryptionKey: Buffer;
  graphVersion: string;
};

export class MetaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MetaConfigError";
  }
}

function readRequired(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new MetaConfigError(`Missing required environment variable: ${name}`);
  }
  return value;
}

function readEncryptionKey(): Buffer {
  const raw = readRequired("META_TOKEN_ENCRYPTION_KEY");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new MetaConfigError(
      "META_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as base64 (use: openssl rand -base64 32)",
    );
  }
  return key;
}

/** Validates Meta OAuth env vars. Server-only. */
export function getMetaEnvConfig(): MetaEnvConfig {
  return {
    appId: readRequired("META_APP_ID"),
    appSecret: readRequired("META_APP_SECRET"),
    redirectUri: readRequired("META_REDIRECT_URI"),
    tokenEncryptionKey: readEncryptionKey(),
    graphVersion: process.env.META_GRAPH_VERSION?.trim() || "v21.0",
  };
}

export function isMetaConfigured(): boolean {
  try {
    getMetaEnvConfig();
    return true;
  } catch {
    return false;
  }
}
