-- Meta overview cache: sync runs + insight snapshots (read from DB on page load).

CREATE TYPE public.meta_sync_status AS ENUM ('running', 'success', 'failed');

CREATE TYPE public.meta_sync_type AS ENUM ('overview');

CREATE TABLE public.meta_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  sync_type public.meta_sync_type NOT NULL DEFAULT 'overview',
  status public.meta_sync_status NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_code text,
  error_message text,
  requested_by_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_sync_runs_org_account_type_started_idx
  ON public.meta_sync_runs (organization_id, connected_meta_ad_account_id, sync_type, started_at DESC);

CREATE TABLE public.meta_overview_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_meta_ad_account_id uuid NOT NULL REFERENCES public.connected_meta_ad_accounts (id) ON DELETE CASCADE,
  date_range_preset text NOT NULL DEFAULT 'last_30d',
  date_start date NOT NULL,
  date_end date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_response jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX meta_overview_snapshots_latest_idx
  ON public.meta_overview_snapshots (
    organization_id,
    connected_meta_ad_account_id,
    date_range_preset,
    synced_at DESC
  );

COMMENT ON TABLE public.meta_sync_runs IS 'Tracks manual and scheduled Meta API sync attempts per org and ad account.';
COMMENT ON TABLE public.meta_overview_snapshots IS 'Cached account-level overview metrics; dashboard reads from here, not Meta directly.';

ALTER TABLE public.meta_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_overview_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY meta_sync_runs_select ON public.meta_sync_runs
  FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY meta_sync_runs_insert ON public.meta_sync_runs
  FOR INSERT
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_sync_runs_update ON public.meta_sync_runs
  FOR UPDATE
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_overview_snapshots_select ON public.meta_overview_snapshots
  FOR SELECT
  USING (public.is_org_member(organization_id));

CREATE POLICY meta_overview_snapshots_insert ON public.meta_overview_snapshots
  FOR INSERT
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_overview_snapshots_update ON public.meta_overview_snapshots
  FOR UPDATE
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));
