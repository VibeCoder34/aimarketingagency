/** Meta Insights `date_preset` values supported on Overview sync. */
export const META_OVERVIEW_DATE_PRESETS = [
  { id: "last_7d", label: "Last 7 days" },
  { id: "last_14d", label: "Last 14 days" },
  { id: "last_30d", label: "Last 30 days" },
  { id: "last_90d", label: "Last 90 days" },
  { id: "maximum", label: "All time", default: true },
] as const;

export type MetaOverviewDatePresetId = (typeof META_OVERVIEW_DATE_PRESETS)[number]["id"];

/** Meta `date_preset=maximum` — longest range Meta allows on account insights. */
export const META_OVERVIEW_DEFAULT_DATE_PRESET: MetaOverviewDatePresetId = "maximum";

export function isMetaOverviewDatePreset(value: string): value is MetaOverviewDatePresetId {
  return META_OVERVIEW_DATE_PRESETS.some((preset) => preset.id === value);
}

export function resolveOverviewDatePreset(input?: string | null): MetaOverviewDatePresetId {
  if (input && isMetaOverviewDatePreset(input)) {
    return input;
  }
  return META_OVERVIEW_DEFAULT_DATE_PRESET;
}

export function labelForOverviewDatePreset(preset: MetaOverviewDatePresetId): string {
  return (
    META_OVERVIEW_DATE_PRESETS.find((p) => p.id === preset)?.label ?? "All time"
  );
}

/** Approximate calendar bounds when Meta returns no insight row (for snapshot metadata). */
export function estimateDateRangeForPreset(preset: MetaOverviewDatePresetId): {
  start: string;
  end: string;
} {
  const end = new Date();
  const start = new Date(end);

  switch (preset) {
    case "last_7d":
      start.setUTCDate(end.getUTCDate() - 7);
      break;
    case "last_14d":
      start.setUTCDate(end.getUTCDate() - 14);
      break;
    case "last_30d":
      start.setUTCDate(end.getUTCDate() - 30);
      break;
    case "last_90d":
      start.setUTCDate(end.getUTCDate() - 90);
      break;
    case "maximum":
      start.setUTCFullYear(2010, 0, 1);
      break;
    default:
      start.setUTCDate(end.getUTCDate() - 30);
  }

  const format = (d: Date) => d.toISOString().slice(0, 10);
  return { start: format(start), end: format(end) };
}
