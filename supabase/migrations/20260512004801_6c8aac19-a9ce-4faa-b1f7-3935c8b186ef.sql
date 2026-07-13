ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_event_email_key UNIQUE (event_id, email);