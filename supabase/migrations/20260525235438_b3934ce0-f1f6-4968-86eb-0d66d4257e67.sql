
REVOKE EXECUTE ON FUNCTION public.increment_coupon_use(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_registration_paid(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_use(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_registration_paid(uuid, numeric, text, text) TO service_role;
