
-- 1. Sponsor gallery table
CREATE TABLE public.sponsor_gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid NOT NULL REFERENCES public.event_sponsors(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sponsor_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sponsor gallery" ON public.sponsor_gallery
  FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM event_sponsors es
    JOIN events e ON e.id = es.event_id
    WHERE es.id = sponsor_gallery.sponsor_id
    AND e.status IN ('published', 'live')
  ));

CREATE POLICY "Admins manage sponsor gallery" ON public.sponsor_gallery
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 2. Add email to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON public.profiles(email) WHERE email IS NOT NULL;

-- 3. Add is_manual to event_registrations
ALTER TABLE public.event_registrations ADD COLUMN IF NOT EXISTS is_manual boolean NOT NULL DEFAULT false;
