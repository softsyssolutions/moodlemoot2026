
-- 1) Revocar EXECUTE a anon en funciones SECURITY DEFINER sensibles
REVOKE EXECUTE ON FUNCTION public.mark_registration_paid(uuid, numeric, text, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_use(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.claim_super_admin() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.generate_ticket_id() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.set_ticket_id() FROM anon, public;

-- Restaurar acceso necesario:
-- claim_first_admin / claim_super_admin se llaman desde el cliente autenticado
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;
-- las demás solo service_role
GRANT EXECUTE ON FUNCTION public.mark_registration_paid(uuid, numeric, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_coupon_use(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_ticket_id() TO service_role;

-- 2) Hacer mark_registration_paid idempotente
CREATE OR REPLACE FUNCTION public.mark_registration_paid(_id uuid, _amount numeric, _category text, _coupon_code text DEFAULT NULL::text)
 RETURNS event_registrations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  r public.event_registrations;
BEGIN
  UPDATE public.event_registrations
     SET payment_status = 'paid',
         amount_paid    = _amount,
         category       = COALESCE(_category, category),
         coupon_code    = COALESCE(_coupon_code, coupon_code)
   WHERE id = _id
     AND payment_status <> 'paid'
  RETURNING * INTO r;

  IF r.id IS NULL THEN
    SELECT * INTO r FROM public.event_registrations WHERE id = _id;
  END IF;
  RETURN r;
END;
$function$;

-- 3) Restringir listing del bucket event-images (mantener lectura por path)
DROP POLICY IF EXISTS "Public can list event-images" ON storage.objects;
DROP POLICY IF EXISTS "event-images public list" ON storage.objects;
DROP POLICY IF EXISTS "Public Access event-images" ON storage.objects;

-- Asegurar policy de lectura por path (sin listing global)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'event-images public read'
  ) THEN
    CREATE POLICY "event-images public read"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'event-images');
  END IF;
END $$;
