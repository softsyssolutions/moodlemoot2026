
-- 1) Extend event_registrations
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'paypal',
  ADD COLUMN IF NOT EXISTS is_manual boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS registered_by uuid,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS last_edited_by uuid,
  ADD COLUMN IF NOT EXISTS last_edited_at timestamptz;

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_event_registrations_updated_at ON public.event_registrations;
CREATE TRIGGER trg_event_registrations_updated_at
BEFORE UPDATE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Audit log table
CREATE TABLE IF NOT EXISTS public.registration_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL CHECK (action IN ('create','update','delete')),
  changes jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_registration_audit_log_registration_id
  ON public.registration_audit_log(registration_id, changed_at DESC);

GRANT SELECT ON public.registration_audit_log TO authenticated;
GRANT ALL ON public.registration_audit_log TO service_role;

ALTER TABLE public.registration_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view registration audit" ON public.registration_audit_log;
CREATE POLICY "Staff view registration audit"
  ON public.registration_audit_log FOR SELECT
  TO authenticated
  USING (public.is_staff(auth.uid()));

-- 3) Trigger function that logs diffs
CREATE OR REPLACE FUNCTION public.log_registration_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  diff jsonb := '{}'::jsonb;
  k text;
  old_row jsonb;
  new_row jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.registration_audit_log(registration_id, changed_by, action, changes)
    VALUES (NEW.id, COALESCE(NEW.registered_by, auth.uid()), 'create', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    old_row := to_jsonb(OLD);
    new_row := to_jsonb(NEW);
    FOR k IN SELECT jsonb_object_keys(new_row) LOOP
      IF k IN ('updated_at','last_edited_at','last_edited_by') THEN CONTINUE; END IF;
      IF (old_row -> k) IS DISTINCT FROM (new_row -> k) THEN
        diff := diff || jsonb_build_object(k, jsonb_build_object('old', old_row -> k, 'new', new_row -> k));
      END IF;
    END LOOP;
    IF diff <> '{}'::jsonb THEN
      INSERT INTO public.registration_audit_log(registration_id, changed_by, action, changes)
      VALUES (NEW.id, COALESCE(NEW.last_edited_by, auth.uid()), 'update', diff);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.registration_audit_log(registration_id, changed_by, action, changes)
    VALUES (OLD.id, auth.uid(), 'delete', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_registration_audit ON public.event_registrations;
CREATE TRIGGER trg_registration_audit
AFTER INSERT OR UPDATE OR DELETE ON public.event_registrations
FOR EACH ROW EXECUTE FUNCTION public.log_registration_changes();

-- 4) Allow staff to DELETE registrations (needed by admin delete action)
DROP POLICY IF EXISTS "Staff can delete registrations" ON public.event_registrations;
CREATE POLICY "Staff can delete registrations"
  ON public.event_registrations FOR DELETE
  TO authenticated
  USING (public.is_staff_or_above(auth.uid()));

-- 5) Helper to resolve admin emails (for showing who created/edited)
CREATE OR REPLACE FUNCTION public.get_user_emails(_ids uuid[])
RETURNS TABLE(id uuid, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.id, u.email::text
  FROM auth.users u
  WHERE u.id = ANY(_ids)
    AND public.is_staff(auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_user_emails(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_emails(uuid[]) TO authenticated;
