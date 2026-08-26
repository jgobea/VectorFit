-- Weekly recurring workout routines. One routine per user (v1 — no
-- multi-routine management, matches the "create a routine" / empty-state
-- flow this migration supports). day_of_week matches JS Date#getDay()
-- (0=Sunday..6=Saturday) so mapping "today" needs no lookup table.
--
-- This supersedes the unused public.workouts.scheduled_date model for
-- routine scheduling — workouts/workout_exercises are left in place
-- (workout_sessions.workout_id still references them) but are no longer
-- populated by the app; only routines/routine_days/routine_exercises are.

create table public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_routines_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

alter table public.routines enable row level security;

create policy "routines_select_own"
  on public.routines for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "routines_insert_own"
  on public.routines for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "routines_update_own"
  on public.routines for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "routines_delete_own"
  on public.routines for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- routine_days — one row per weekday per routine, always all 7, created
-- alongside the routine so day toggles are always an update, never an
-- insert/delete.
-- ---------------------------------------------------------------------------
create table public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  is_rest_day boolean not null default true,
  notes text,
  unique (routine_id, day_of_week)
);

create index routine_days_routine_id_idx on public.routine_days (routine_id);

alter table public.routine_days enable row level security;

create policy "routine_days_select_own"
  on public.routine_days for select
  to authenticated
  using (exists (
    select 1 from public.routines r where r.id = routine_days.routine_id and r.user_id = (select auth.uid())
  ));

create policy "routine_days_insert_own"
  on public.routine_days for insert
  to authenticated
  with check (exists (
    select 1 from public.routines r where r.id = routine_days.routine_id and r.user_id = (select auth.uid())
  ));

create policy "routine_days_update_own"
  on public.routine_days for update
  to authenticated
  using (exists (
    select 1 from public.routines r where r.id = routine_days.routine_id and r.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.routines r where r.id = routine_days.routine_id and r.user_id = (select auth.uid())
  ));

create policy "routine_days_delete_own"
  on public.routine_days for delete
  to authenticated
  using (exists (
    select 1 from public.routines r where r.id = routine_days.routine_id and r.user_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- routine_exercises — aggregate sets/reps/weight/rest per exercise per day
-- (not per-set rows; see HANDOFF.md discussion for why this is the v1 shape).
-- ---------------------------------------------------------------------------
create table public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  order_index smallint not null default 0,
  sets smallint,
  reps smallint,
  weight_kg numeric(6, 2),
  duration_seconds integer,
  rest_seconds integer
);

create index routine_exercises_routine_day_id_idx on public.routine_exercises (routine_day_id);

alter table public.routine_exercises enable row level security;

create policy "routine_exercises_select_own"
  on public.routine_exercises for select
  to authenticated
  using (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_exercises.routine_day_id and r.user_id = (select auth.uid())
  ));

create policy "routine_exercises_insert_own"
  on public.routine_exercises for insert
  to authenticated
  with check (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_exercises.routine_day_id and r.user_id = (select auth.uid())
  ));

create policy "routine_exercises_update_own"
  on public.routine_exercises for update
  to authenticated
  using (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_exercises.routine_day_id and r.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_exercises.routine_day_id and r.user_id = (select auth.uid())
  ));

create policy "routine_exercises_delete_own"
  on public.routine_exercises for delete
  to authenticated
  using (exists (
    select 1 from public.routine_days d join public.routines r on r.id = d.routine_id
    where d.id = routine_exercises.routine_day_id and r.user_id = (select auth.uid())
  ));
