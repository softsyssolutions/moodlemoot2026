-- service_role bypasses RLS, so these "true" policies are redundant and trigger the linter.
DROP POLICY IF EXISTS "Service role inserts payments" ON public.payments;
DROP POLICY IF EXISTS "Service role updates payments" ON public.payments;
