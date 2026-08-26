-- Whole-day completion — distinct from routine_exercise_completions
-- (per-exercise, used for the individual check/camera toggles). Written
-- once per day when the user confirms the "Finish Day" flow, after every
-- exercise for the day is checked off. Also becomes the real data source
-- for the Dashboard's "workouts this week" / streak stats, which
-- previously read from workout_sessions — a table the app never actually
-- writes to.
create table public.routine_day_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  routine_id uuid not null references public.routines (id) on delete cascade,
  completed_date date not null,
  exercise_count smallint not null,
  total_load_kg numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (user_id, completed_date)
);

create index routine_day_completions_user_date_idx
  on public.routine_day_completions (user_id, completed_date);

alter table public.routine_day_completions enable row level security;

create policy "routine_day_completions_select_own"
  on public.routine_day_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "routine_day_completions_insert_own"
  on public.routine_day_completions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
