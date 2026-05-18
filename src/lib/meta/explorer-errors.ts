export type MetaExplorerErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONNECTION_NOT_FOUND"
  | "TOKEN_EXPIRED"
  | "AD_ACCOUNT_NOT_FOUND"
  | "META_API_ERROR"
  | "RATE_LIMITED"
  | "INVALID_REQUEST"
  | "CONFIG_ERROR";

export class MetaExplorerError extends Error {
  readonly code: MetaExplorerErrorCode;
  readonly metaCode?: number;

  constructor(code: MetaExplorerErrorCode, message: string, metaCode?: number) {
    super(message);
    this.name = "MetaExplorerError";
    this.code = code;
    this.metaCode = metaCode;
  }
}

export function toSafeExplorerErrorResponse(err: unknown): {
  ok: false;
  error: { code: MetaExplorerErrorCode; message: string };
} {
  if (err instanceof MetaExplorerError) {
    return { ok: false, error: { code: err.code, message: err.message } };
  }
  return {
    ok: false,
    error: {
      code: "META_API_ERROR",
      message: "Meta API request failed. Please try again.",
    },
  };
}
