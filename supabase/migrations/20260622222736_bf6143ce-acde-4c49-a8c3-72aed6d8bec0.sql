-- Hardening: ensure validate_coupon RPC is never executable by anon/authenticated/PUBLIC.
-- Coupon validation must only flow through the service-role edge function.
REVOKE EXECUTE ON FUNCTION public.validate_coupon(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_coupon(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.validate_coupon(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO service_role;