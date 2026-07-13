
-- Remove open INSERT policy (registrations now flow through service-role edge functions only)
DROP POLICY IF EXISTS "Anyone can register" ON public.event_registrations;

-- Allow authenticated users to view their own registration(s) by matching email
CREATE POLICY "Users can view their own registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  lower(email) = lower(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), ''))
);
