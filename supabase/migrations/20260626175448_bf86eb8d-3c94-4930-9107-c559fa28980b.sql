
-- Auto-grant admin role to super admin emails on signup/confirmation so they never get locked out
CREATE OR REPLACE FUNCTION public.grant_super_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL
     AND lower(NEW.email) IN (
       'jimi@buendata.com',
       'hernan@industriaelearning.com.pe',
       'rafael@industriaelearning.com.pe',
       'dayana@industriaelearning.com.pe'
     )
  THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_super_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_super_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_super_admin_on_signup();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_super_admin ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_super_admin
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_super_admin_on_signup();

-- Backfill: ensure hernan (and any other already-existing super admin user) has the role row
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users
WHERE lower(email) IN (
  'jimi@buendata.com',
  'hernan@industriaelearning.com.pe',
  'rafael@industriaelearning.com.pe',
  'dayana@industriaelearning.com.pe'
)
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE lower(email) IN (
  'jimi@buendata.com',
  'hernan@industriaelearning.com.pe',
  'rafael@industriaelearning.com.pe',
  'dayana@industriaelearning.com.pe'
)
ON CONFLICT (user_id, role) DO NOTHING;
