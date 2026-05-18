# Supabase migrations (AdPilot)

## Apply migrations

**Option A — Supabase CLI** (recommended)

```bash
# From repo root, link your project once:
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to remote:
npx supabase db push
```

**Option B — SQL Editor**

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run the contents of `migrations/20260516120000_saas_foundation.sql`.

## What this migration creates

- Core tables: `organizations`, `profiles`, `organization_members`, `invitations`, Meta connection tables, `audit_logs`, `usage_events`, `billing_subscriptions`
- `auth.users` trigger: provisions org + profile + owner membership on signup (works with email confirmation)
- RPC `ensure_user_workspace()` for idempotent repair after login
- RLS policies and helper functions `is_org_member`, `has_org_role`

## Signup metadata

Sign up must pass `full_name` and `agency_name` in `options.data` (already done in `login-form.tsx`). The database trigger reads `raw_user_meta_data`.

## Troubleshooting: "Could not find the table in the schema cache"

This means the **Supabase project in `.env.local`** does not have the migration applied (or API cache is stale).

1. **Table Editor** → confirm `profiles`, `organizations` exist.
2. If missing → run `migrations/20260516120000_saas_foundation.sql` on **that** project (after reset script if needed).
3. Match URLs: Dashboard → Settings → API → Project URL must equal `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`.
4. Reload PostgREST schema (SQL Editor):

```sql
NOTIFY pgrst, 'reload schema';
```

5. Restart `npm run dev`.

Verify in SQL Editor:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('profiles', 'organizations');

SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'ensure_user_workspace';
```
