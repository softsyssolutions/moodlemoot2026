
-- Enums
CREATE TYPE public.speaker_role AS ENUM ('keynote', 'speaker', 'panelist');
CREATE TYPE public.session_type AS ENUM ('magistral', 'paralela', 'social');
CREATE TYPE public.sponsor_tier AS ENUM ('oro', 'plata', 'bronce');
CREATE TYPE public.registration_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- event_speakers
CREATE TABLE public.event_speakers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  bio text,
  photo_url text,
  institution text,
  country text,
  role public.speaker_role NOT NULL DEFAULT 'speaker',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage speakers" ON public.event_speakers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active event speakers" ON public.event_speakers FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_speakers.event_id AND e.status IN ('published', 'live')
  ));

-- event_sessions
CREATE TABLE public.event_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  speaker_id uuid REFERENCES public.event_speakers(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_time timestamptz,
  end_time timestamptz,
  day_number integer NOT NULL DEFAULT 1,
  session_type public.session_type NOT NULL DEFAULT 'magistral',
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sessions" ON public.event_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active event sessions" ON public.event_sessions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_sessions.event_id AND e.status IN ('published', 'live')
  ));

-- event_sponsors
CREATE TABLE public.event_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  website text,
  description text,
  tier public.sponsor_tier NOT NULL DEFAULT 'bronce',
  slug text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.event_sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sponsors" ON public.event_sponsors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read active event sponsors" ON public.event_sponsors FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.events e WHERE e.id = event_sponsors.event_id AND e.status IN ('published', 'live')
  ));

-- event_registrations
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.registration_status NOT NULL DEFAULT 'pending',
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage registrations" ON public.event_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own registration" ON public.event_registrations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own registration" ON public.event_registrations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
