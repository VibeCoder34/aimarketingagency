"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NormalizedDailyInsight } from "@/lib/data/types";
import { formatCurrency } from "@/lib/utils";
import { OverviewCard } from "@/components/overview/overview-shell";

function formatShortDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SpendEfficiencyChart({
  data,
  caption,
}: {
  data: NormalizedDailyInsight[];
  caption: string;
}) {
  const chartData = data.map((row) => ({
    ...row,
    label: formatShortDate(row.date),
  }));

  return (
    <OverviewCard title="Spend & efficiency trend" subtitle="Last 14 days · daily">
      <div className="h-[280px] w-full min-w-0 sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="spend"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={44}
            />
            <YAxis
              yAxisId="roas"
              orientation="right"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}x`}
              width={36}
              domain={["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e4e4e7",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.06)",
                fontSize: 12,
              }}
              formatter={(value, name) => {
                const n = Number(value);
                if (name === "spend") return [formatCurrency(n), "Spend"];
                if (name === "roas") return [`${n.toFixed(2)}x`, "ROAS"];
                return [value, name];
              }}
              labelFormatter={(label) => String(label)}
            />
            <Bar yAxisId="spend" dataKey="spend" fill="#93c5fd" radius={[4, 4, 0, 0]} maxBarSize={28} name="spend" />
            <Line
              yAxisId="roas"
              type="monotone"
              dataKey="roas"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 2, fill: "#2563eb" }}
              name="roas"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-zinc-500">{caption}</p>
    </OverviewCard>
  );
}
