CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  role_title text NOT NULL,
  institution text NOT NULL,
  institution_type text NOT NULL CHECK (institution_type IN ('privada','publica','universidad','otra')),
  attendance_type text NOT NULL CHECK (attendance_type IN ('presencial','virtual','hibrido')),
  country text NOT NULL,
  city text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX event_registrations_event_email_uidx
  ON public.event_registrations (event_id, lower(email));

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register"
  ON public.event_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff view registrations"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (is_staff(auth.uid()));