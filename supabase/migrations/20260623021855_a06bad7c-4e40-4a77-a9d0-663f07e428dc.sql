DROP POLICY IF EXISTS "Users can view their own registrations" ON public.event_registrations;

CREATE POLICY "Users can view their own registrations"
ON public.event_registrations
FOR SELECT
TO authenticated
USING (
  lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
);