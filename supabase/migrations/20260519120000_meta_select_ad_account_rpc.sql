-- Allow any org member to set the workspace default Meta ad account (is_selected).

CREATE OR REPLACE FUNCTION public.set_selected_meta_ad_account(p_account_row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT organization_id INTO v_org_id
  FROM public.connected_meta_ad_accounts
  WHERE id = p_account_row_id
    AND connection_status = 'connected';

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Ad account not found or not connected';
  END IF;

  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  UPDATE public.connected_meta_ad_accounts
  SET is_selected = false
  WHERE organization_id = v_org_id;

  UPDATE public.connected_meta_ad_accounts
  SET is_selected = true
  WHERE id = p_account_row_id;
END;
$$;

COMMENT ON FUNCTION public.set_selected_meta_ad_account IS
  'Sets the org-wide default Meta ad account for dashboard/overview (any active org member).';

GRANT EXECUTE ON FUNCTION public.set_selected_meta_ad_account(uuid) TO authenticated;
