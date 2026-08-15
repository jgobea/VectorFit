-- Security advisor flagged public.handle_new_user() (SECURITY DEFINER) as
-- callable via PostgREST RPC by anon/authenticated, since Postgres grants
-- EXECUTE on new functions to PUBLIC by default. It's only meant to run as
-- the on_auth_user_created trigger, which doesn't need this grant.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
