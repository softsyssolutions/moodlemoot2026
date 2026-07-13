
-- Events: allow anon to view published/live events
DROP POLICY IF EXISTS "Users view published events" ON public.events;
CREATE POLICY "Public view published events"
  ON public.events FOR SELECT
  TO public
  USING (status = ANY (ARRAY['published'::text, 'live'::text]));

-- Speakers: allow anon to read speakers of published/live events
DROP POLICY IF EXISTS "Public read active event speakers" ON public.event_speakers;
CREATE POLICY "Public read active event speakers"
  ON public.event_speakers FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_speakers.event_id
      AND e.status = ANY (ARRAY['published'::text, 'live'::text])
  ));

-- Sessions: allow anon to read sessions of published/live events
DROP POLICY IF EXISTS "Public read active event sessions" ON public.event_sessions;
CREATE POLICY "Public read active event sessions"
  ON public.event_sessions FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_sessions.event_id
      AND e.status = ANY (ARRAY['published'::text, 'live'::text])
  ));

-- Sponsors: allow anon to read sponsors of published/live events
DROP POLICY IF EXISTS "Public read active event sponsors" ON public.event_sponsors;
CREATE POLICY "Public read active event sponsors"
  ON public.event_sponsors FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_sponsors.event_id
      AND e.status = ANY (ARRAY['published'::text, 'live'::text])
  ));
