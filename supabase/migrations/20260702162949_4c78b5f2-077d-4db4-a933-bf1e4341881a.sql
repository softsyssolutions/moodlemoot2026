
CREATE POLICY "portal-uploads staff read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'portal-uploads' AND public.is_staff(auth.uid()));

CREATE POLICY "portal-uploads block insert"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id <> 'portal-uploads');

CREATE POLICY "portal-uploads block update"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id <> 'portal-uploads')
  WITH CHECK (bucket_id <> 'portal-uploads');

CREATE POLICY "portal-uploads block delete"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id <> 'portal-uploads');
