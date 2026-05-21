-- Overview default date range: all-time (Meta maximum) instead of last 30 days.

ALTER TABLE public.meta_overview_snapshots
  ALTER COLUMN date_range_preset SET DEFAULT 'maximum';
