-- AdPilot SaaS foundation: organizations, profiles, Meta connections (future),
-- audit logs, usage/billing, and RLS.
-- Run via Supabase CLI: supabase db push
-- Or paste into Supabase Dashboard → SQL Editor.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.member_role AS ENUM (
  'owner',
  'admin',
  'media_buyer',
  'analyst',
  'viewer'
);

CREATE TYPE public.member_status AS ENUM (
  'active',
  'invited',
  'suspended',
  'removed'
);

CREATE TYPE public.meta_connection_status AS ENUM (
  'connected',
  'disconnected',
  'expired',
  'error',
  'restricted'
);

CREATE TYPE public.subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'free'
);

CREATE TYPE public.audit_risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- ---------------------------------------------------------------------------
-- Utility: slug + updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT lower(
    regexp_replace(
      regexp_replace(trim(COALESCE(input, '')), '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+',
      '-',
      'g'
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- organizations — agency / workspace (multi-tenant root)
-- ---------------------------------------------------------------------------
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  legal_name text,
  website text,
  industry text,
  company_size text,
  country text,
  timezone text NOT NULL DEFAULT 'UTC',
  currency char(3) NOT NULL DEFAULT 'USD',
  owner_user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  onboarding_completed boolean NOT NULL DEFAULT false,
  meta_connection_status public.meta_connection_status NOT NULL DEFAULT 'disconnected',
  -- Denormalized hint for UI; source of truth for plan is billing_subscriptions
  plan_tier text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT organizations_slug_unique UNIQUE (slug)
);

CREATE INDEX organizations_owner_user_id_idx ON public.organizations (owner_user_id);
CREATE INDEX organizations_deleted_at_idx ON public.organizations (deleted_at)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE public.organizations IS 'Agency workspace. One org per agency; supports soft delete for churn.';
COMMENT ON COLUMN public.organizations.meta_connection_status IS 'Aggregate Meta link state; updated when BM connections change.';

CREATE OR REPLACE FUNCTION public.generate_unique_org_slug(base_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  candidate text;
  suffix int := 0;
BEGIN
  base_slug := left(public.slugify(base_name), 48);
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'agency';
  END IF;

  candidate := base_slug;
  WHILE EXISTS (
    SELECT 1
    FROM public.organizations o
    WHERE o.slug = candidate
      AND o.deleted_at IS NULL
  ) LOOP
    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  END LOOP;

  RETURN candidate;
END;
$$;

-- ---------------------------------------------------------------------------
-- profiles — personal user account (not org membership)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  default_organization_id uuid REFERENCES public.organizations (id) ON DELETE SET NULL,
  job_title text,
  phone text,
  locale text,
  timezone text,
  onboarding_completed boolean NOT NULL DEFAULT false,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_default_organization_id_idx ON public.profiles (default_organization_id);
CREATE INDEX profiles_email_idx ON public.profiles (email);

COMMENT ON TABLE public.profiles IS 'Authenticated user profile. Roles live in organization_members.';

-- ---------------------------------------------------------------------------
-- organization_members — team membership per workspace
-- ---------------------------------------------------------------------------
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  role public.member_role NOT NULL DEFAULT 'viewer',
  status public.member_status NOT NULL DEFAULT 'active',
  invited_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT organization_members_org_user_unique UNIQUE (organization_id, user_id)
);

CREATE INDEX organization_members_user_id_idx ON public.organization_members (user_id);
CREATE INDEX organization_members_organization_id_idx ON public.organization_members (organization_id);

-- ---------------------------------------------------------------------------
-- invitations — future team invite flow
-- ---------------------------------------------------------------------------
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.member_role NOT NULL DEFAULT 'viewer',
  invite_token_hash text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invitations_organization_id_idx ON public.invitations (organization_id);
CREATE INDEX invitations_email_idx ON public.invitations (lower(email));

COMMENT ON COLUMN public.invitations.invite_token_hash IS 'Store SHA-256 of invite token only; never store raw tokens.';

-- ---------------------------------------------------------------------------
-- connected_meta_businesses — Meta Business Manager OAuth (read-only phase)
-- ---------------------------------------------------------------------------
CREATE TABLE public.connected_meta_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  connected_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  meta_business_id text NOT NULL,
  meta_business_name text NOT NULL,
  -- TODO: encrypt at application layer (e.g. Vault / pgsodium) before persisting.
  -- Never store plaintext Meta user/system tokens in this column.
  access_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[],
  connection_status public.meta_connection_status NOT NULL DEFAULT 'disconnected',
  last_synced_at timestamptz,
  last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT connected_meta_businesses_org_bm_unique UNIQUE (organization_id, meta_business_id)
);

CREATE INDEX connected_meta_businesses_organization_id_idx
  ON public.connected_meta_businesses (organization_id);

COMMENT ON TABLE public.connected_meta_businesses IS 'Meta BM connections. AdPilot v1: read-only Marketing API; no campaign mutations.';
COMMENT ON COLUMN public.connected_meta_businesses.access_token_encrypted IS 'Ciphertext only. App must encrypt/decrypt outside plain SQL.';

-- ---------------------------------------------------------------------------
-- connected_meta_ad_accounts — ad account selection & sync cursors
-- ---------------------------------------------------------------------------
CREATE TABLE public.connected_meta_ad_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  meta_business_connection_id uuid NOT NULL
    REFERENCES public.connected_meta_businesses (id) ON DELETE CASCADE,
  meta_ad_account_id text NOT NULL,
  meta_ad_account_name text NOT NULL,
  account_status text,
  currency char(3),
  timezone_name text,
  timezone_offset_hours_utc numeric(4, 2),
  amount_spent numeric(18, 2),
  balance numeric(18, 2),
  is_selected boolean NOT NULL DEFAULT false,
  permissions text[],
  last_insights_sync_at timestamptz,
  last_campaigns_sync_at timestamptz,
  connection_status public.meta_connection_status NOT NULL DEFAULT 'disconnected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT connected_meta_ad_accounts_org_account_unique UNIQUE (organization_id, meta_ad_account_id)
);

CREATE INDEX connected_meta_ad_accounts_organization_id_idx
  ON public.connected_meta_ad_accounts (organization_id);
CREATE INDEX connected_meta_ad_accounts_business_connection_id_idx
  ON public.connected_meta_ad_accounts (meta_business_connection_id);

COMMENT ON TABLE public.connected_meta_ad_accounts IS 'Synced ad accounts for reporting. is_selected drives dashboard account picker.';

-- ---------------------------------------------------------------------------
-- audit_logs — safety trail for Meta, AI, and dangerous actions
-- ---------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  risk_level public.audit_risk_level,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_organization_id_created_at_idx
  ON public.audit_logs (organization_id, created_at DESC);

COMMENT ON TABLE public.audit_logs IS 'Append-only safety log: Meta connect/disconnect, AI recs, blocked destructive actions.';

-- ---------------------------------------------------------------------------
-- usage_events — AI tokens, provider costs, future metering
-- ---------------------------------------------------------------------------
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  event_type text NOT NULL,
  provider text,
  model text,
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(12, 6),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX usage_events_organization_id_created_at_idx
  ON public.usage_events (organization_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- billing_subscriptions — per-organization billing state
-- ---------------------------------------------------------------------------
CREATE TABLE public.billing_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations (id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'free',
  billing_provider text,
  provider_customer_id text,
  provider_subscription_id text,
  trial_ends_at timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT billing_subscriptions_organization_unique UNIQUE (organization_id)
);

COMMENT ON TABLE public.billing_subscriptions IS 'Stripe/LemonSqueezy hooks update via service role; clients read-only.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER invitations_updated_at
  BEFORE UPDATE ON public.invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER connected_meta_businesses_updated_at
  BEFORE UPDATE ON public.connected_meta_businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER connected_meta_ad_accounts_updated_at
  BEFORE UPDATE ON public.connected_meta_ad_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER billing_subscriptions_updated_at
  BEFORE UPDATE ON public.billing_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Signup provisioning (auth.users → org + profile + owner membership)
-- Runs on INSERT so email-confirmation signups are provisioned before first login.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_user_workspace(
  p_user_id uuid,
  p_email text,
  p_full_name text,
  p_agency_name text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_agency_name text;
  v_org_id uuid;
  v_slug text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    SELECT default_organization_id INTO v_org_id FROM public.profiles WHERE id = p_user_id;
    RETURN v_org_id;
  END IF;

  v_full_name := COALESCE(NULLIF(trim(p_full_name), ''), split_part(p_email, '@', 1));
  v_agency_name := COALESCE(NULLIF(trim(p_agency_name), ''), v_full_name || ' Agency');
  v_slug := public.generate_unique_org_slug(v_agency_name);

  INSERT INTO public.organizations (name, slug, owner_user_id)
  VALUES (v_agency_name, v_slug, p_user_id)
  RETURNING id INTO v_org_id;

  INSERT INTO public.profiles (id, full_name, email, default_organization_id)
  VALUES (p_user_id, v_full_name, p_email, v_org_id);

  INSERT INTO public.organization_members (
    organization_id,
    user_id,
    role,
    status,
    joined_at
  )
  VALUES (v_org_id, p_user_id, 'owner', 'active', now());

  INSERT INTO public.billing_subscriptions (
    organization_id,
    plan_name,
    status,
    trial_ends_at
  )
  VALUES (v_org_id, 'free', 'trialing', now() + interval '14 days');

  INSERT INTO public.audit_logs (
    organization_id,
    actor_user_id,
    action,
    entity_type,
    entity_id,
    risk_level,
    metadata
  )
  VALUES (
    v_org_id,
    p_user_id,
    'workspace.created',
    'organization',
    v_org_id::text,
    'low',
    jsonb_build_object('source', 'signup')
  );

  RETURN v_org_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.provision_user_workspace(
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'agency_name'
  );
  RETURN NEW;
END;
$$;

-- Idempotent safety net callable from app after login / email confirm
CREATE OR REPLACE FUNCTION public.ensure_user_workspace()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user auth.users%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_user FROM auth.users WHERE id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  RETURN public.provision_user_workspace(
    v_user.id,
    v_user.email,
    v_user.raw_user_meta_data->>'full_name',
    v_user.raw_user_meta_data->>'agency_name'
  );
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helpers (after all tables — references organization_members)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_org_member(p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = p_organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.has_org_role(p_organization_id uuid, p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = p_organization_id
      AND om.user_id = auth.uid()
      AND om.status = 'active'
      AND om.role::text = ANY (p_roles)
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_meta_businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_meta_ad_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- organizations
CREATE POLICY organizations_select_member ON public.organizations
  FOR SELECT TO authenticated
  USING (public.is_org_member(id) AND deleted_at IS NULL);

CREATE POLICY organizations_update_admin ON public.organizations
  FOR UPDATE TO authenticated
  USING (public.has_org_role(id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(id, ARRAY['owner', 'admin']));

-- organization_members
CREATE POLICY organization_members_select_member ON public.organization_members
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY organization_members_insert_admin ON public.organization_members
  FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY organization_members_update_admin ON public.organization_members
  FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY organization_members_delete_admin ON public.organization_members
  FOR DELETE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

-- invitations
CREATE POLICY invitations_select_member ON public.invitations
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY invitations_insert_admin ON public.invitations
  FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY invitations_update_admin ON public.invitations
  FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY invitations_delete_admin ON public.invitations
  FOR DELETE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

-- connected_meta_businesses
CREATE POLICY meta_businesses_select_member ON public.connected_meta_businesses
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY meta_businesses_insert_admin ON public.connected_meta_businesses
  FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_businesses_update_admin ON public.connected_meta_businesses
  FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_businesses_delete_admin ON public.connected_meta_businesses
  FOR DELETE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

-- connected_meta_ad_accounts
CREATE POLICY meta_ad_accounts_select_member ON public.connected_meta_ad_accounts
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY meta_ad_accounts_insert_admin ON public.connected_meta_ad_accounts
  FOR INSERT TO authenticated
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_ad_accounts_update_admin ON public.connected_meta_ad_accounts
  FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

CREATE POLICY meta_ad_accounts_delete_admin ON public.connected_meta_ad_accounts
  FOR DELETE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

-- audit_logs (append-only from client)
CREATE POLICY audit_logs_select_member ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY audit_logs_insert_member ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_org_member(organization_id)
    AND (actor_user_id IS NULL OR actor_user_id = auth.uid())
  );

-- usage_events
CREATE POLICY usage_events_select_member ON public.usage_events
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY usage_events_insert_member ON public.usage_events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_org_member(organization_id)
    AND (user_id IS NULL OR user_id = auth.uid())
  );

-- billing_subscriptions
CREATE POLICY billing_subscriptions_select_member ON public.billing_subscriptions
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id));

CREATE POLICY billing_subscriptions_update_admin ON public.billing_subscriptions
  FOR UPDATE TO authenticated
  USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']));

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, UPDATE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invitations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connected_meta_businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.connected_meta_ad_accounts TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT ON public.usage_events TO authenticated;
GRANT SELECT, UPDATE ON public.billing_subscriptions TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_workspace() TO authenticated;
