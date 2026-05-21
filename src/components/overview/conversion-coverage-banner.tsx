import { AlertCircle } from "lucide-react";
import type { OverviewPerformance } from "@/lib/data/types";

export function ConversionCoverageBanner({
  performance,
}: {
  performance: OverviewPerformance | null | undefined;
}) {
  if (!performance || performance.hasConversionData) {
    return null;
  }

  const message =
    performance.conversionCoverageMessage ??
    "Conversion events were not returned for this account/range.";

  return (
    <div
      className="flex gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm"
      role="status"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div>
        <p className="font-medium">Conversion data not available</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-900/90">{message}</p>
      </div>
    </div>
  );
}
