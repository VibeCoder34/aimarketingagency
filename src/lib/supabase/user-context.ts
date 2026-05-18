import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardUserContext, Organization, Profile } from "@/types/database";

/** PostgREST has not seen tables/functions yet (migration not applied or cache stale). */
function isSchemaNotReadyError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("could not find the table") ||
    m.includes("could not find the function") ||
    m.includes("relation") && m.includes("does not exist")
  );
}

const PROFILE_COLUMNS =
  "id, full_name, email, avatar_url, default_organization_id, job_title, phone, locale, timezone, onboarding_completed, last_seen_at, created_at, updated_at";

const ORGANIZATION_COLUMNS =
  "id, name, slug, legal_name, website, industry, company_size, country, timezone, currency, owner_user_id, onboarding_completed, meta_connection_status, plan_tier, created_at, updated_at, deleted_at";

/**
 * Ensures workspace rows exist (idempotent). Safe after email confirmation or legacy users.
 */
export async function ensureUserWorkspace(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("ensure_user_workspace");
  if (error) {
    if (isSchemaNotReadyError(error.message)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[AdPilot] Database migration not applied on this Supabase project. Run supabase/migrations/20260516120000_saas_foundation.sql in the SQL Editor.",
        );
      }
      return false;
    }
    console.error("[ensure_user_workspace]", error.message);
    return false;
  }
  return true;
}

export async function getDashboardUserContext(): Promise<DashboardUserContext> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, organization: null };
  }

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (profileError) {
    if (isSchemaNotReadyError(profileError.message)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[AdPilot] profiles table missing — apply SaaS migration in Supabase SQL Editor, then reload schema.",
        );
      }
      return { profile: null, organization: null };
    }
    console.error("[profiles]", profileError.message);
  }

  if (!profile && !profileError) {
    const provisioned = await ensureUserWorkspace();
    if (provisioned) {
      const retry = await supabase
        .from("profiles")
        .select(PROFILE_COLUMNS)
        .eq("id", user.id)
        .maybeSingle<Profile>();
      profile = retry.data ?? null;
      if (retry.error && !isSchemaNotReadyError(retry.error.message)) {
        console.error("[profiles retry]", retry.error.message);
      }
    }
  }

  if (!profile) {
    return {
      profile: null,
      organization: null,
    };
  }

  const orgId = profile.default_organization_id;
  if (!orgId) {
    return { profile, organization: null };
  }

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select(ORGANIZATION_COLUMNS)
    .eq("id", orgId)
    .is("deleted_at", null)
    .maybeSingle<Organization>();

  if (orgError) {
    console.error("[organizations]", orgError.message);
  }

  return {
    profile,
    organization: organization ?? null,
  };
}

export function toSidebarUser(ctx: DashboardUserContext, fallbackEmail?: string | null) {
  const profile = ctx.profile;
  const email = profile?.email ?? fallbackEmail ?? null;
  const name =
    profile?.full_name?.trim() ||
    (email ? email.split("@")[0] : "User");

  return {
    name,
    email,
    avatarUrl: profile?.avatar_url ?? null,
  };
}

export function toAgencyName(ctx: DashboardUserContext, fallback: string): string {
  return ctx.organization?.name?.trim() || fallback;
}
