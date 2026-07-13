CREATE POLICY "Deny client inserts on payments" ON public.payments FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Deny client updates on payments" ON public.payments FOR UPDATE TO authenticated, anon USING (false) WITH CHECK (false);
CREATE POLICY "Deny client deletes on payments" ON public.payments FOR DELETE TO authenticated, anon USING (false);