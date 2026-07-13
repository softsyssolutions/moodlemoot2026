CREATE POLICY "Owners or staff can update push subscriptions"
ON public.push_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR public.is_staff_or_above(auth.uid()))
WITH CHECK (user_id = auth.uid() OR public.is_staff_or_above(auth.uid()));