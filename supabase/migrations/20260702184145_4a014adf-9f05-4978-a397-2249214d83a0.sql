-- Fix inverted portal-uploads storage policies (they were PERMISSIVE with negated bucket check,
-- effectively granting write access to every OTHER bucket). Replace with RESTRICTIVE policies
-- scoped to portal-uploads that deny client writes; staff/service_role continue to write via
-- explicit staff policies / service key.
DROP POLICY IF EXISTS "portal-uploads block insert" ON storage.objects;
DROP POLICY IF EXISTS "portal-uploads block update" ON storage.objects;
DROP POLICY IF EXISTS "portal-uploads block delete" ON storage.objects;

CREATE POLICY "portal-uploads deny client insert"
  ON storage.objects AS RESTRICTIVE FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id <> 'portal-uploads');

CREATE POLICY "portal-uploads deny client update"
  ON storage.objects AS RESTRICTIVE FOR UPDATE TO anon, authenticated
  USING (bucket_id <> 'portal-uploads')
  WITH CHECK (bucket_id <> 'portal-uploads');

CREATE POLICY "portal-uploads deny client delete"
  ON storage.objects AS RESTRICTIVE FOR DELETE TO anon, authenticated
  USING (bucket_id <> 'portal-uploads');

-- Revoke anon EXECUTE on SECURITY DEFINER functions that were unintentionally callable by anon.
-- Trigger functions do not need EXECUTE grants; get_user_emails is staff-only and should require auth.
REVOKE EXECUTE ON FUNCTION public.get_user_emails(uuid[]) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.grant_super_admin_on_signup() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_registration_changes() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;