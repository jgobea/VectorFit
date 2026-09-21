-- Google sign-in (signInWithIdToken, see lib/googleAuth.ts) populates
-- auth.users.raw_user_meta_data from the ID token's claims — Google's own
-- claims are `name`/`picture`, but Supabase also writes the normalized
-- `full_name`/`avatar_url` keys some providers use, so check both. Falls
-- back to null (unchanged from before) for email/password signups, which
-- carry no such metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end;
$$;
