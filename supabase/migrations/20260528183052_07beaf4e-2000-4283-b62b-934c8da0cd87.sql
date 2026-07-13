
DROP POLICY IF EXISTS "Anyone can update push subscription by endpoint" ON public.push_subscriptions;
REVOKE UPDATE, DELETE ON public.push_subscriptions FROM anon, authenticated;
GRANT INSERT ON public.push_subscriptions TO anon, authenticated;
GRANT SELECT ON public.push_subscriptions TO authenticated;
