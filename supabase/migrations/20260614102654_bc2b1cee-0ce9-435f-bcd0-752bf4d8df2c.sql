-- Hide phone numbers from other users by revoking column-level access
REVOKE SELECT (phone) ON public.profiles FROM anon, authenticated;

-- Lock down SECURITY DEFINER helper functions that should only run from triggers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;