
-- ============================================================
-- 1. HELPER FUNCTIONS
-- ============================================================

-- Súper administrador global: solo jimi@buendata.com
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(email) = 'jimi@buendata.com'
  )
$$;

-- Admin = rol admin o super_admin (por email)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_super_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = 'admin'::public.app_role
    )
$$;

-- Staff o superior
CREATE OR REPLACE FUNCTION public.is_staff_or_above(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_admin(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = 'staff'::public.app_role
    )
$$;

-- Reemplazar is_staff anterior para que también acepte el nuevo rol 'staff'
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_staff_or_above(_user_id)
$$;

-- ============================================================
-- 2. EVENT_REGISTRATIONS: nuevas columnas
-- ============================================================

ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS ticket_id text,
  ADD COLUMN IF NOT EXISTS checked_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS checked_in_by uuid,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS id_card_url text;

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_payment_status_check;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_payment_status_check
  CHECK (payment_status IN ('pending','paid','free','failed','refunded'));

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_category_check;
ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_category_check
  CHECK (category IN ('full','staff50','edu100'));

-- Generador de ticket_id MM26-XXXX (sin 0/O/1/I)
CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  exists_already boolean;
  attempts int := 0;
BEGIN
  LOOP
    candidate := 'MM26-' ||
      substr(alphabet, 1+floor(random()*length(alphabet))::int, 1) ||
      substr(alphabet, 1+floor(random()*length(alphabet))::int, 1) ||
      substr(alphabet, 1+floor(random()*length(alphabet))::int, 1) ||
      substr(alphabet, 1+floor(random()*length(alphabet))::int, 1);
    SELECT EXISTS(SELECT 1 FROM public.event_registrations WHERE ticket_id = candidate) INTO exists_already;
    EXIT WHEN NOT exists_already;
    attempts := attempts + 1;
    IF attempts > 50 THEN RAISE EXCEPTION 'Could not allocate ticket_id'; END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_ticket_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.ticket_id IS NULL THEN
    NEW.ticket_id := public.generate_ticket_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_registrations_set_ticket_id ON public.event_registrations;
CREATE TRIGGER trg_event_registrations_set_ticket_id
  BEFORE INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.set_ticket_id();

-- Backfill ticket_id en filas existentes
UPDATE public.event_registrations
  SET ticket_id = public.generate_ticket_id()
  WHERE ticket_id IS NULL;

ALTER TABLE public.event_registrations
  ALTER COLUMN ticket_id SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_ticket_id_key
  ON public.event_registrations(ticket_id);

-- Política UPDATE para staff (check-in)
DROP POLICY IF EXISTS "Staff can check-in registrations" ON public.event_registrations;
CREATE POLICY "Staff can check-in registrations"
  ON public.event_registrations
  FOR UPDATE TO authenticated
  USING (public.is_staff_or_above(auth.uid()))
  WITH CHECK (public.is_staff_or_above(auth.uid()));

-- ============================================================
-- 3. COUPONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  category text NOT NULL CHECK (category IN ('staff50','edu100')),
  discount_percent int NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  requires_id_card boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  max_uses int,
  uses_count int NOT NULL DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_coupons_updated_at ON public.coupons;
CREATE TRIGGER trg_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validador público (vía RPC, devuelve solo lo necesario)
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text)
RETURNS TABLE (
  valid boolean,
  category text,
  discount_percent int,
  requires_id_card boolean,
  reason text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE upper(code) = upper(_code);
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::text, NULL::int, NULL::boolean, 'not_found'::text;
    RETURN;
  END IF;
  IF NOT c.active THEN
    RETURN QUERY SELECT false, c.category, c.discount_percent, c.requires_id_card, 'inactive'::text;
    RETURN;
  END IF;
  IF c.expires_at IS NOT NULL AND c.expires_at < now() THEN
    RETURN QUERY SELECT false, c.category, c.discount_percent, c.requires_id_card, 'expired'::text;
    RETURN;
  END IF;
  IF c.max_uses IS NOT NULL AND c.uses_count >= c.max_uses THEN
    RETURN QUERY SELECT false, c.category, c.discount_percent, c.requires_id_card, 'max_uses_reached'::text;
    RETURN;
  END IF;
  RETURN QUERY SELECT true, c.category, c.discount_percent, c.requires_id_card, NULL::text;
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(text) TO anon, authenticated;

-- ============================================================
-- 4. PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.event_registrations(id) ON DELETE SET NULL,
  provider text NOT NULL DEFAULT 'paypal',
  provider_order_id text UNIQUE,
  provider_capture_id text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','refunded')),
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view payments" ON public.payments;
CREATE POLICY "Admins view payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. CHECK_IN_EVENTS (trazabilidad temporal)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.check_in_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  category text NOT NULL,
  checked_in_at timestamptz NOT NULL DEFAULT now(),
  checked_in_by uuid
);

CREATE INDEX IF NOT EXISTS check_in_events_event_time_idx
  ON public.check_in_events(event_id, checked_in_at);

ALTER TABLE public.check_in_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view check-ins" ON public.check_in_events;
CREATE POLICY "Staff view check-ins"
  ON public.check_in_events FOR SELECT TO authenticated
  USING (public.is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS "Staff insert check-ins" ON public.check_in_events;
CREATE POLICY "Staff insert check-ins"
  ON public.check_in_events FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_or_above(auth.uid()));

-- ============================================================
-- 6. USER_ROLES: solo super_admin gestiona
-- ============================================================

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Super admin manage roles" ON public.user_roles;
CREATE POLICY "Super admin manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Función para que jimi@buendata.com reclame super_admin en su primer login
CREATE OR REPLACE FUNCTION public.claim_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT lower(email) INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS DISTINCT FROM 'jimi@buendata.com' THEN
    RETURN false;
  END IF;
  INSERT INTO public.user_roles(user_id, role)
    VALUES (uid, 'super_admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_super_admin() TO authenticated;

-- Si jimi ya tiene cuenta, asignar super_admin
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'jimi@buendata.com'
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. STORAGE: bucket privado education-ids
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('education-ids', 'education-ids', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can upload edu IDs" ON storage.objects;
CREATE POLICY "Public can upload edu IDs"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'education-ids'
    AND (storage.foldername(name))[1] = 'edu'
  );

DROP POLICY IF EXISTS "Admins read edu IDs" ON storage.objects;
CREATE POLICY "Admins read edu IDs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'education-ids' AND public.is_admin(auth.uid()));

-- ============================================================
-- 8. SEED COUPONS
-- ============================================================

INSERT INTO public.coupons (code, category, discount_percent, requires_id_card, active)
VALUES
  ('STAFF50', 'staff50', 50, false, true),
  ('EDU100',  'edu100', 100, true,  true)
ON CONFLICT (code) DO NOTHING;
