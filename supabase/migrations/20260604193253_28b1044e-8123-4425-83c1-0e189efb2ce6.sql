
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Backfill from payments.updated_at when there is a completed payment
UPDATE public.event_registrations r
   SET paid_at = p.updated_at
  FROM public.payments p
 WHERE p.registration_id = r.id
   AND p.status = 'completed'
   AND r.payment_status = 'paid'
   AND r.paid_at IS NULL;

-- Fallback: any paid registration without paid_at (e.g. EDU100 freebies) uses created_at
UPDATE public.event_registrations
   SET paid_at = created_at
 WHERE payment_status = 'paid'
   AND paid_at IS NULL;

-- Update mark_registration_paid to set paid_at
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
         coupon_code    = COALESCE(_coupon_code, coupon_code),
         paid_at        = COALESCE(paid_at, now())
   WHERE id = _id
     AND payment_status <> 'paid'
  RETURNING * INTO r;

  IF r.id IS NULL THEN
    SELECT * INTO r FROM public.event_registrations WHERE id = _id;
  END IF;
  RETURN r;
END;
$function$;
