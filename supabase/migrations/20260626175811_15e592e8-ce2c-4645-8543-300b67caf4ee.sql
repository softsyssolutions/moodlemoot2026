
CREATE POLICY "Owners can delete own push subscriptions"
ON public.push_subscriptions
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
