-- Explicit deny INSERT/UPDATE/DELETE policies for education-ids bucket
-- Service role bypasses RLS, so the edge function continues to work.

DROP POLICY IF EXISTS "Deny client inserts on education-ids" ON storage.objects;
CREATE POLICY "Deny client inserts on education-ids"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (false AND bucket_id = 'education-ids');

DROP POLICY IF EXISTS "Deny client updates on education-ids" ON storage.objects;
CREATE POLICY "Deny client updates on education-ids"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (false AND bucket_id = 'education-ids')
WITH CHECK (false);

DROP POLICY IF EXISTS "Deny client deletes on education-ids" ON storage.objects;
CREATE POLICY "Deny client deletes on education-ids"
ON storage.objects
FOR DELETE
TO anon, authenticated
USING (false AND bucket_id = 'education-ids');
