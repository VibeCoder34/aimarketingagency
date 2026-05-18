import type { PlatformBreakdown } from "@/lib/data/types";
import { OverviewCard } from "@/components/overview/overview-shell";
import { formatCurrency, formatNumber } from "@/lib/utils";

const PLATFORM_COLORS: Record<string, string> = {
  Facebook: "#1877f2",
  Instagram: "#e1306c",
};

export function PlatformBreakdownCard({
  platforms,
  insight,
}: {
  platforms: PlatformBreakdown[];
  insight: string;
}) {
  return (
    <OverviewCard title="Platform breakdown" subtitle="Spend share & efficiency">
      <div className="space-y-4">
        {platforms.map((p) => (
          <div key={p.platform}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-900">{p.platform}</span>
              <span className="tabular-nums text-zinc-600">
                {formatCurrency(p.spend)} · {p.percent}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${p.percent}%`,
                  backgroundColor: PLATFORM_COLORS[p.platform] ?? "#71717a",
                }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
              {p.roas != null ? <span>ROAS {p.roas.toFixed(2)}x</span> : null}
              {p.clicks != null ? <span>{formatNumber(p.clicks)} clicks</span> : null}
              {p.cpc != null ? <span>CPC ${p.cpc.toFixed(2)}</span> : null}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-xs leading-relaxed text-zinc-600">
        {insight}
      </p>
    </OverviewCard>
  );
}
