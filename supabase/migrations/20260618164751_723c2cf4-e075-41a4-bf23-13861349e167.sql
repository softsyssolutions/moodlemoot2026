
-- 1. Explicit admin SELECT policy on chatbot_leads
CREATE POLICY "Admins view chatbot leads"
  ON public.chatbot_leads
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- 2. Push subscriptions: bind inserts to caller's user_id (or anonymous null)
DROP POLICY IF EXISTS "Anyone can subscribe to push" ON public.push_subscriptions;
CREATE POLICY "Users subscribe own push"
  ON public.push_subscriptions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 3. Education IDs: remove public upload policy. All uploads go through
-- the upload-education-id edge function using the service role.
DROP POLICY IF EXISTS "Public can upload edu IDs" ON storage.objects;

-- 4. event-images is a public bucket; public URLs work without RLS.
-- Drop the broad SELECT policies that allowed bucket listing.
DROP POLICY IF EXISTS "Public read event images" ON storage.objects;
DROP POLICY IF EXISTS "event-images public read" ON storage.objects;

-- 5. Lock down EXECUTE on internal functions.
-- Server-only RPCs: revoke from anon and authenticated (service_role keeps access).
REVOKE EXECUTE ON FUNCTION public.validate_coupon(text)            FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_use(text)       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_registration_paid(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_ticket_id()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_ticket_id()                  FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()       FROM PUBLIC, anon, authenticated;

-- Helper functions used in RLS / called from client by signed-in users:
-- revoke from anon, keep for authenticated and service_role.
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid)                   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid)             FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid)                   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_staff_or_above(uuid)          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)  FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin()              FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_super_admin()              FROM PUBLIC, anon;
