
-- Function to check if the current user is the assignee of an item
CREATE OR REPLACE FUNCTION public.is_assignee(_user_id uuid, _assignee text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND name = _assignee
  )
$$;

-- Drop old update policy
DROP POLICY IF EXISTS "Creator or admin can update items" ON public.items;

-- Create new update policy including assignee
CREATE POLICY "Creator, admin, or assignee can update items"
ON public.items
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = created_by)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_assignee(auth.uid(), assignee)
);
