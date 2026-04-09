
-- Tighten the items update policy: only allow updates by the creator or admins
DROP POLICY "Authenticated users can update items" ON public.items;
CREATE POLICY "Creator or admin can update items" ON public.items
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
