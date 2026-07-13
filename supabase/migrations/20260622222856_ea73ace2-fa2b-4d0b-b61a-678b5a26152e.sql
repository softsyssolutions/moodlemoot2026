DROP POLICY IF EXISTS "Staff insert event-images" ON storage.objects;
CREATE POLICY "Staff insert event-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff update event-images" ON storage.objects;
CREATE POLICY "Staff update event-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'event-images' AND public.is_staff(auth.uid()));

DROP POLICY IF EXISTS "Staff delete event-images" ON storage.objects;
CREATE POLICY "Staff delete event-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND public.is_staff(auth.uid()));
