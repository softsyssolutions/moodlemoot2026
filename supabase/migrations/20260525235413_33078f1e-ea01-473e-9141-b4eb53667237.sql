
-- Atomic coupon usage increment
CREATE OR REPLACE FUNCTION public.increment_coupon_use(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated int;
BEGIN
  UPDATE public.coupons
     SET uses_count = uses_count + 1,
         updated_at = now()
   WHERE upper(code) = upper(_code)
     AND active = true
     AND (max_uses IS NULL OR uses_count < max_uses)
     AND (expires_at IS NULL OR expires_at > now());
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated > 0;
END;
$$;

-- Mark a registration as paid (used by edge functions via service role)
CREATE OR REPLACE FUNCTION public.mark_registration_paid(
  _id uuid,
  _amount numeric,
  _category text,
  _coupon_code text DEFAULT NULL
)
RETURNS public.event_registrations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.event_registrations;
BEGIN
  UPDATE public.event_registrations
     SET payment_status = 'paid',
         amount_paid    = _amount,
         category       = COALESCE(_category, category),
         coupon_code    = COALESCE(_coupon_code, coupon_code)
   WHERE id = _id
  RETURNING * INTO r;
  RETURN r;
END;
$$;

-- Allow service_role to insert into payments (edge functions use service role)
DROP POLICY IF EXISTS "Service role inserts payments" ON public.payments;
CREATE POLICY "Service role inserts payments"
  ON public.payments
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role updates payments" ON public.payments;
CREATE POLICY "Service role updates payments"
  ON public.payments
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_ticket_id_idx
  ON public.event_registrations(ticket_id);
CREATE INDEX IF NOT EXISTS event_registrations_email_idx
  ON public.event_registrations(lower(email));
CREATE INDEX IF NOT EXISTS payments_provider_order_id_idx
  ON public.payments(provider_order_id);
CREATE INDEX IF NOT EXISTS payments_registration_id_idx
  ON public.payments(registration_id);
