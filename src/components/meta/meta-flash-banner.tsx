"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  META_OAUTH_ERROR_MESSAGES,
  type MetaOAuthErrorReason,
} from "@/lib/meta/errors";

export function MetaFlashBanner() {
  const searchParams = useSearchParams();
  const metaFlash = searchParams.get("meta");
  const reason = searchParams.get("reason") as MetaOAuthErrorReason | null;

  const banner = useMemo(() => {
    if (metaFlash === "connected") {
      return {
        variant: "success" as const,
        message: "Meta Ads connected successfully. Campaign data will sync on the next import.",
      };
    }
    if (metaFlash === "disconnected") {
      return {
        variant: "success" as const,
        message: "Meta Ads disconnected. Read-only access has been removed from AdPilot.",
      };
    }
    if (metaFlash === "error" && reason && META_OAUTH_ERROR_MESSAGES[reason]) {
      return {
        variant: "danger" as const,
        message: META_OAUTH_ERROR_MESSAGES[reason],
      };
    }
    return null;
  }, [metaFlash, reason]);

  if (!banner) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        banner.variant === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-red-200 bg-red-50 text-red-900"
      }`}
      role="status"
    >
      {banner.message}
    </div>
  );
}


