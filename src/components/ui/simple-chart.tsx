export type BarChartItem = { label: string; value: number; display?: string };

export function HorizontalBarChart({ items, maxValue }: { items: BarChartItem[]; maxValue?: number }) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium text-[var(--adpilot-text-primary)]">{item.label}</span>
            <span className="shrink-0 tabular-nums text-[var(--adpilot-text-muted)]">{item.display ?? item.value}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[var(--adpilot-bg-main)]">
            <div
              className="h-2 rounded-full bg-[var(--adpilot-accent)]"
              style={{ width: `${Math.min(100, (item.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DualTrendChart({ data }: { data: { label: string; spend: number; roas: number }[] }) {
  const maxSpend = Math.max(...data.map((d) => d.spend), 1);
  const sample = data.filter((_, i) => i % 3 === 0);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 overflow-x-auto pb-1" style={{ minHeight: 140 }}>
        {sample.map((d) => (
          <div key={d.label} className="flex min-w-[24px] flex-1 flex-col items-center gap-1">
            <div
              className="w-full max-w-[20px] rounded-t bg-[var(--adpilot-accent)]/50"
              style={{ height: `${(d.spend / maxSpend) * 120}px`, minHeight: 4 }}
            />
            <span className="text-[8px] text-[var(--adpilot-text-muted)]">{d.label.slice(8)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-[var(--adpilot-text-muted)]">Daily spend (bars) — last 30 days sampled</p>
    </div>
  );
}

export function DonutStatRow({ items }: { items: { label: string; value: string; percent: number; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-semibold"
            style={{
              background: `conic-gradient(${item.color} 0 ${item.percent}%, var(--adpilot-bg-main) ${item.percent}% 100%)`,
            }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--adpilot-surface)] text-[10px]">
              {item.percent}%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--adpilot-text-primary)]">{item.label}</p>
            <p className="text-sm tabular-nums text-[var(--adpilot-text-muted)]">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LineAreaChart({ data }: { data: { date: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (d.value / max) * 80;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 40" className="h-32 w-full" preserveAspectRatio="none">
      <polyline fill="none" stroke="var(--adpilot-accent)" strokeWidth="1.5" points={points} />
    </svg>
  );
}

export function MiniStatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-[var(--adpilot-radius-item)] border border-[var(--adpilot-border)] bg-[var(--adpilot-bg-main)] p-3">
      <p className="text-xs text-[var(--adpilot-text-muted)]">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--adpilot-text-primary)]">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-[var(--adpilot-text-muted)]">{sub}</p> : null}
    </div>
  );
}
