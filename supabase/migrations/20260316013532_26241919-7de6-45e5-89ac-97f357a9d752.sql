
-- Allow admins to delete user_roles (needed for role changes)
-- The existing "Admins can manage roles" ALL policy already covers this.
-- But we need to allow the member-to-admin upgrade path:
-- When a member changes someone's role, they need delete+insert on user_roles.
-- The ALL policy with has_role check already handles this for admins.
-- No changes needed.
SELECT 1;
