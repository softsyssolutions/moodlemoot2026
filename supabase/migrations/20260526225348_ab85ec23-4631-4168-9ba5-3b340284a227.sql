
ALTER TABLE public.event_registrations
  ADD COLUMN IF NOT EXISTS id_card_status text NOT NULL DEFAULT 'pending';

ALTER TABLE public.event_registrations REPLICA IDENTITY FULL;
ALTER TABLE public.check_in_events REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.event_registrations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.check_in_events;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
