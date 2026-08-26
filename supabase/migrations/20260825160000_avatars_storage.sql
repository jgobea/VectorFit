-- Avatar storage: a public bucket (avatar URLs are rendered directly in
-- <Image>, no signed-URL plumbing) with per-user write access enforced by
-- object path convention: objects live at "<user_id>/<filename>".
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_select_all"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

-- Storage upsert (replacing an existing avatar) needs INSERT + SELECT +
-- UPDATE — granting only INSERT lets new uploads through but silently fails
-- on overwrite. (select) policy above already covers the SELECT half.
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);
