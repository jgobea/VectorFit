-- Lets users add their own exercises to the catalog instead of being
-- limited to the admin-seeded list. `created_by` null = shared/seeded
-- (visible to everyone, e.g. the QuickPose-trackable ones from
-- 20260818210000); non-null = a user's own custom exercise, visible only
-- to them. Custom exercises can never claim a quickpose_feature — nobody
-- but this app's own team can verify a string against QuickPose's actual
-- supported list (see INSTRUCTIONS.md: "Do not guess QuickPose feature
-- strings"), so the insert policy forces it null.

alter table public.exercises add column created_by uuid references public.users (id) on delete cascade;

create index exercises_created_by_idx on public.exercises (created_by);

drop policy "exercises_select_all" on public.exercises;

create policy "exercises_select_shared_or_own"
  on public.exercises for select
  to authenticated
  using (created_by is null or created_by = (select auth.uid()));

create policy "exercises_insert_own_custom"
  on public.exercises for insert
  to authenticated
  with check (created_by = (select auth.uid()) and quickpose_feature is null);

create policy "exercises_delete_own_custom"
  on public.exercises for delete
  to authenticated
  using (created_by = (select auth.uid()));
