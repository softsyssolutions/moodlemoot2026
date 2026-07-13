
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  format text NOT NULL DEFAULT 'virtual' CHECK (format IN ('virtual', 'presencial', 'hibrido')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'live', 'ended')),
  banner_url text,
  location text,
  max_attendees integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with events
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Published/live events visible to all authenticated users
CREATE POLICY "Users view published events" ON public.events
  FOR SELECT TO authenticated
  USING (status IN ('published', 'live'));

-- Trigger to update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
