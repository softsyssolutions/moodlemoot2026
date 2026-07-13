
DO $$ BEGIN
  CREATE TYPE public.portal_entity AS ENUM ('speaker','sponsor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.requirement_type AS ENUM ('short_text','long_text','file','url','country','acceptance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.portal_status AS ENUM ('invited','in_progress','completed','approved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.event_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  entity public.portal_entity NOT NULL,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  help TEXT,
  type public.requirement_type NOT NULL DEFAULT 'short_text',
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_global BOOLEAN NOT NULL DEFAULT true,
  publishes_to_web BOOLEAN NOT NULL DEFAULT false,
  allow_delegate BOOLEAN NOT NULL DEFAULT false,
  order_index INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, entity, key)
);
CREATE INDEX IF NOT EXISTS idx_event_requirements_event ON public.event_requirements(event_id, entity, order_index);

GRANT SELECT ON public.event_requirements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_requirements TO authenticated;
GRANT ALL ON public.event_requirements TO service_role;

ALTER TABLE public.event_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "req public read active"
  ON public.event_requirements FOR SELECT
  USING (active = true);

CREATE POLICY "req staff manage"
  ON public.event_requirements FOR ALL
  TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.speaker_portal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  country_dial_code TEXT,
  status public.portal_status NOT NULL DEFAULT 'invited',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  published_speaker_id UUID REFERENCES public.event_speakers(id) ON DELETE SET NULL,
  order_index INT NOT NULL DEFAULT 0,
  closed BOOLEAN NOT NULL DEFAULT false,
  last_activity_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_speaker_portal_event ON public.speaker_portal(event_id, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaker_portal TO authenticated;
GRANT ALL ON public.speaker_portal TO service_role;

ALTER TABLE public.speaker_portal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "speaker_portal staff manage"
  ON public.speaker_portal FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.sponsor_portal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  country_dial_code TEXT,
  tier TEXT,
  status public.portal_status NOT NULL DEFAULT 'invited',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  published_sponsor_id UUID REFERENCES public.event_sponsors(id) ON DELETE SET NULL,
  order_index INT NOT NULL DEFAULT 0,
  closed BOOLEAN NOT NULL DEFAULT false,
  last_activity_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sponsor_portal_event ON public.sponsor_portal(event_id, order_index);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_portal TO authenticated;
GRANT ALL ON public.sponsor_portal TO service_role;

ALTER TABLE public.sponsor_portal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sponsor_portal staff manage"
  ON public.sponsor_portal FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.requirement_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_type public.portal_entity NOT NULL,
  portal_id UUID NOT NULL,
  requirement_id UUID NOT NULL REFERENCES public.event_requirements(id) ON DELETE CASCADE,
  value_text TEXT,
  value_url TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INT,
  is_delegated BOOLEAN NOT NULL DEFAULT false,
  completed BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (portal_type, portal_id, requirement_id)
);
CREATE INDEX IF NOT EXISTS idx_requirement_values_portal ON public.requirement_values(portal_type, portal_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirement_values TO authenticated;
GRANT ALL ON public.requirement_values TO service_role;

ALTER TABLE public.requirement_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "req_values staff manage"
  ON public.requirement_values FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.requirement_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_type public.portal_entity NOT NULL,
  portal_id UUID NOT NULL,
  requirement_id UUID REFERENCES public.event_requirements(id) ON DELETE CASCADE,
  applies BOOLEAN NOT NULL DEFAULT true,
  custom_label TEXT,
  custom_help TEXT,
  custom_type public.requirement_type,
  custom_required BOOLEAN,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_requirement_overrides_portal ON public.requirement_overrides(portal_type, portal_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.requirement_overrides TO authenticated;
GRANT ALL ON public.requirement_overrides TO service_role;

ALTER TABLE public.requirement_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "req_overrides staff manage"
  ON public.requirement_overrides FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

DROP TRIGGER IF EXISTS trg_event_requirements_updated ON public.event_requirements;
CREATE TRIGGER trg_event_requirements_updated BEFORE UPDATE ON public.event_requirements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_speaker_portal_updated ON public.speaker_portal;
CREATE TRIGGER trg_speaker_portal_updated BEFORE UPDATE ON public.speaker_portal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sponsor_portal_updated ON public.sponsor_portal;
CREATE TRIGGER trg_sponsor_portal_updated BEFORE UPDATE ON public.sponsor_portal
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_requirement_values_updated ON public.requirement_values;
CREATE TRIGGER trg_requirement_values_updated BEFORE UPDATE ON public.requirement_values
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
