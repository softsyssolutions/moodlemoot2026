
CREATE TABLE public.sponsor_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  name text NOT NULL,
  position text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente',
  locale text DEFAULT 'es',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.sponsor_proposals TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.sponsor_proposals TO authenticated;
GRANT ALL ON public.sponsor_proposals TO service_role;

ALTER TABLE public.sponsor_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit sponsor proposals"
  ON public.sponsor_proposals FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view sponsor proposals"
  ON public.sponsor_proposals FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage sponsor proposals"
  ON public.sponsor_proposals FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete sponsor proposals"
  ON public.sponsor_proposals FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER update_sponsor_proposals_updated_at
  BEFORE UPDATE ON public.sponsor_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
