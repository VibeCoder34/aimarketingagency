import type { SupabaseClient } from "@supabase/supabase-js";

export async function setSelectedMetaAdAccount(
  supabase: SupabaseClient,
  connectedAccountRowId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.rpc("set_selected_meta_ad_account", {
    p_account_row_id: connectedAccountRowId,
  });

  if (error) {
    console.error("[meta/select-ad-account]", error.message);
    const message =
      error.message.includes("not found")
        ? "Ad account not found. Refresh Settings and try again."
        : error.message.includes("Forbidden")
          ? "You do not have access to this workspace."
          : "Could not switch ad account. Please try again.";
    return { ok: false, message };
  }

  return { ok: true };
}
