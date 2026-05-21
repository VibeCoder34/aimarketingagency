import type { MetaConnectAuthContext } from "@/lib/meta/auth";
import type { MetaReportingSyncType } from "@/lib/meta/sync/types";

export async function createMetaSyncRun(
  auth: MetaConnectAuthContext,
  connectedMetaAdAccountId: string,
  syncType: MetaReportingSyncType,
): Promise<string> {
  const { data, error } = await auth.supabase
    .from("meta_sync_runs")
    .insert({
      organization_id: auth.organizationId,
      connected_meta_ad_account_id: connectedMetaAdAccountId,
      sync_type: syncType,
      status: "running",
      requested_by_user_id: auth.userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create meta_sync_runs row.");
  }

  return data.id as string;
}

export async function completeMetaSyncRun(
  auth: MetaConnectAuthContext,
  syncRunId: string,
): Promise<void> {
  await auth.supabase
    .from("meta_sync_runs")
    .update({
      status: "success",
      completed_at: new Date().toISOString(),
    })
    .eq("id", syncRunId);
}

export async function failMetaSyncRun(
  auth: MetaConnectAuthContext,
  syncRunId: string,
  errorCode: string,
  errorMessage: string,
): Promise<void> {
  await auth.supabase
    .from("meta_sync_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      error_code: errorCode,
      error_message: errorMessage,
    })
    .eq("id", syncRunId);
}
