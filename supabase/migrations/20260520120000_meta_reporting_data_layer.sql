-- Meta reporting data layer: raw snapshots, normalized entity/daily/breakdown/creative tables.

CREATE TYPE public.meta_insight_entity_level AS ENUM ('account', 'campaign', 'adset', 'ad');

CREATE TYPE public.meta_breakdown_kind AS ENUM (
  'publisher_platform',
  'platform_position',
  'device_platform',
  'age_gender',
  'country',
  'region'
);

ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'account_daily';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'campaign_insights';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'adset_insights';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'ad_insights';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'campaign_daily';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'adset_daily';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'ad_daily';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'breakdown_platform';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'breakdown_platform_position';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'breakdown_device';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'breakdown_demographics';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'breakdown_geo';
ALTER TYPE public.meta_sync_type ADD VALUE IF NOT EXISTS 'creatives';

-- Raw payloads per sync run (audit + reprocessing).
CREATE TABLE public.meta_raw_insight_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  sync_type public.meta_sync_type NOT NULL,
  entity_level public.meta_insight_entity_level,
  breakdown_kind public.meta_breakdown_kind,
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  row_count integer NOT NULL DEFAULT 0,
  truncated boolean NOT NULL DEFAULT false,
  raw_response jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_raw_insight_snapshots_run_idx
  ON public.meta_raw_insight_snapshots (sync_run_id);

CREATE INDEX meta_raw_insight_snapshots_account_type_idx
  ON public.meta_raw_insight_snapshots (
    organization_id,
    connected_meta_ad_account_id,
    sync_type,
    created_at DESC
  );

-- Period aggregate: campaign / adset / ad (Phase 2).
CREATE TABLE public.meta_campaign_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  campaign_id text NOT NULL,
  campaign_name text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_campaign_insights_lookup_idx
  ON public.meta_campaign_insights (
    organization_id,
    connected_meta_ad_account_id,
    date_range_preset,
    campaign_id,
    created_at DESC
  );

CREATE TABLE public.meta_adset_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  campaign_id text,
  campaign_name text,
  adset_id text NOT NULL,
  adset_name text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_adset_insights_lookup_idx
  ON public.meta_adset_insights (
    organization_id,
    connected_meta_ad_account_id,
    date_range_preset,
    adset_id,
    created_at DESC
  );

CREATE TABLE public.meta_ad_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  campaign_id text,
  campaign_name text,
  adset_id text,
  adset_name text,
  ad_id text NOT NULL,
  ad_name text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_ad_insights_lookup_idx
  ON public.meta_ad_insights (
    organization_id,
    connected_meta_ad_account_id,
    date_range_preset,
    ad_id,
    created_at DESC
  );

-- Daily time series (Phase 3).
CREATE TABLE public.meta_account_daily_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  insight_date date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_account_daily_insights_lookup_idx
  ON public.meta_account_daily_insights (
    organization_id,
    connected_meta_ad_account_id,
    insight_date DESC
  );

CREATE TABLE public.meta_campaign_daily_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  campaign_id text NOT NULL,
  campaign_name text,
  insight_date date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_campaign_daily_insights_lookup_idx
  ON public.meta_campaign_daily_insights (
    organization_id,
    connected_meta_ad_account_id,
    campaign_id,
    insight_date DESC
  );

CREATE TABLE public.meta_adset_daily_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  campaign_id text,
  adset_id text NOT NULL,
  adset_name text,
  insight_date date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_adset_daily_insights_lookup_idx
  ON public.meta_adset_daily_insights (
    organization_id,
    connected_meta_ad_account_id,
    adset_id,
    insight_date DESC
  );

CREATE TABLE public.meta_ad_daily_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  campaign_id text,
  adset_id text,
  ad_id text NOT NULL,
  ad_name text,
  insight_date date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_ad_daily_insights_lookup_idx
  ON public.meta_ad_daily_insights (
    organization_id,
    connected_meta_ad_account_id,
    ad_id,
    insight_date DESC
  );

-- Breakdowns (Phase 4).
CREATE TABLE public.meta_platform_breakdowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  breakdown_kind public.meta_breakdown_kind NOT NULL,
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  publisher_platform text,
  platform_position text,
  device_platform text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_platform_breakdowns_lookup_idx
  ON public.meta_platform_breakdowns (
    organization_id,
    connected_meta_ad_account_id,
    breakdown_kind,
    created_at DESC
  );

CREATE TABLE public.meta_demographic_breakdowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  age text,
  gender text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_demographic_breakdowns_lookup_idx
  ON public.meta_demographic_breakdowns (
    organization_id,
    connected_meta_ad_account_id,
    created_at DESC
  );

CREATE TABLE public.meta_geo_breakdowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  breakdown_kind public.meta_breakdown_kind NOT NULL DEFAULT 'country',
  date_range_preset text NOT NULL,
  date_start date NOT NULL,
  date_end date NOT NULL,
  country text,
  region text,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_row jsonb,
  conversion_metrics_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_geo_breakdowns_lookup_idx
  ON public.meta_geo_breakdowns (
    organization_id,
    connected_meta_ad_account_id,
    breakdown_kind,
    created_at DESC
  );

-- Creative metadata (Phase 5).
CREATE TABLE public.meta_creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  sync_run_id uuid NOT NULL REFERENCES public.meta_sync_runs (id) ON DELETE CASCADE,
  ad_id text NOT NULL,
  ad_name text,
  creative_id text,
  thumbnail_url text,
  body_text text,
  title text,
  description text,
  call_to_action_type text,
  object_story_spec jsonb,
  asset_feed_spec jsonb,
  image_hash text,
  video_id text,
  raw_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_creatives_lookup_idx
  ON public.meta_creatives (
    organization_id,
    connected_meta_ad_account_id,
    ad_id,
    created_at DESC
  );

-- RLS
ALTER TABLE public.meta_raw_insight_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaign_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_adset_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_account_daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_campaign_daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_adset_daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ad_daily_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_platform_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_demographic_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_geo_breakdowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_creatives ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'meta_raw_insight_snapshots',
    'meta_campaign_insights',
    'meta_adset_insights',
    'meta_ad_insights',
    'meta_account_daily_insights',
    'meta_campaign_daily_insights',
    'meta_adset_daily_insights',
    'meta_ad_daily_insights',
    'meta_platform_breakdowns',
    'meta_demographic_breakdowns',
    'meta_geo_breakdowns',
    'meta_creatives'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I_select ON public.%I FOR SELECT USING (public.is_org_member(organization_id))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_insert ON public.%I FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY[''owner'', ''admin'']))',
      tbl, tbl
    );
    EXECUTE format(
      'CREATE POLICY %I_update ON public.%I FOR UPDATE USING (public.has_org_role(organization_id, ARRAY[''owner'', ''admin''])) WITH CHECK (public.has_org_role(organization_id, ARRAY[''owner'', ''admin'']))',
      tbl, tbl
    );
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE ON public.meta_raw_insight_snapshots TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_campaign_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_adset_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_ad_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_account_daily_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_campaign_daily_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_adset_daily_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_ad_daily_insights TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_platform_breakdowns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_demographic_breakdowns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_geo_breakdowns TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.meta_creatives TO authenticated;
