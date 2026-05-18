export type MemberRole = "owner" | "admin" | "media_buyer" | "analyst" | "viewer";
export type MemberStatus = "active" | "invited" | "suspended" | "removed";
export type MetaConnectionStatus =
  | "connected"
  | "disconnected"
  | "expired"
  | "error"
  | "restricted";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "free";
export type AuditRiskLevel = "low" | "medium" | "high" | "critical";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  default_organization_id: string | null;
  job_title: string | null;
  phone: string | null;
  locale: string | null;
  timezone: string | null;
  onboarding_completed: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  legal_name: string | null;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  timezone: string;
  currency: string;
  owner_user_id: string;
  onboarding_completed: boolean;
  meta_connection_status: MetaConnectionStatus;
  plan_tier: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  status: MemberStatus;
  invited_by: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardUserContext = {
  profile: Profile | null;
  organization: Organization | null;
};
