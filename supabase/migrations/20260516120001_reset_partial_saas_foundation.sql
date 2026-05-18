-- Run ONLY if the first migration failed halfway (e.g. organization_members does not exist error).
-- Then re-run: 20260516120000_saas_foundation.sql (fixed order)

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.ensure_user_workspace() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.provision_user_workspace(uuid, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.is_org_member(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.has_org_role(uuid, text[]) CASCADE;

DROP TABLE IF EXISTS public.usage_events CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.connected_meta_ad_accounts CASCADE;
DROP TABLE IF EXISTS public.connected_meta_businesses CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.billing_subscriptions CASCADE;
DROP TABLE IF EXISTS public.organization_members CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

DROP FUNCTION IF EXISTS public.generate_unique_org_slug(text) CASCADE;
DROP FUNCTION IF EXISTS public.slugify(text) CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

DROP TYPE IF EXISTS public.audit_risk_level CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.meta_connection_status CASCADE;
DROP TYPE IF EXISTS public.member_status CASCADE;
DROP TYPE IF EXISTS public.member_role CASCADE;
