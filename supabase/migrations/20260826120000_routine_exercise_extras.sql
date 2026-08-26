-- Adds a custom-icon slot per routine exercise, and daily completion
-- tracking for the Today's Workout checklist/camera flow. Completion is
-- dated (not a flag on routine_exercises itself) because routine_days
-- recur weekly — a Monday's exercises must be markable done independently
-- each week, not permanently once and forever after.

alter table public.routine_exercises add column icon text;

create table public.routine_exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  routine_exercise_id uuid not null references public.routine_exercises (id) on delete cascade,
  completed_date date not null,
  completed_at timestamptz not null default now(),
  unique (routine_exercise_id, completed_date)
);

create index routine_exercise_completions_user_date_idx
  on public.routine_exercise_completions (user_id, completed_date);

alter table public.routine_exercise_completions enable row level security;

create policy "routine_exercise_completions_select_own"
  on public.routine_exercise_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "routine_exercise_completions_insert_own"
  on public.routine_exercise_completions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "routine_exercise_completions_delete_own"
  on public.routine_exercise_completions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
