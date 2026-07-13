DELETE FROM public.payments WHERE registration_id IN (SELECT id FROM public.event_registrations WHERE payment_status = 'pending');
DELETE FROM public.check_in_events WHERE registration_id IN (SELECT id FROM public.event_registrations WHERE payment_status = 'pending');
DELETE FROM public.event_registrations WHERE payment_status = 'pending';