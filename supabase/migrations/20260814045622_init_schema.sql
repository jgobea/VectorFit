-- VectorFit initial schema
-- Tables: users, exercises, workouts, workout_exercises, workout_sessions,
-- chat_messages, pose_sessions.
-- workout_exercises is a join table required to relate workouts <-> exercises
-- (not a standalone feature); everything else maps 1:1 to INSTRUCTIONS.md.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- users (profile, 1:1 with auth.users)
-- Email lives on auth.users only — read it from the client session instead
-- of duplicating it here, to avoid staleness.
-- theme preference is NOT stored here: INSTRUCTIONS.md has uiStore persist
-- it locally via AsyncStorage.
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  age smallint check (age between 13 and 120),
  height_cm numeric(5, 1) check (height_cm > 0),
  weight_kg numeric(5, 1) check (weight_kg > 0),
  weight_updated_at timestamptz,
  gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  body_type text,
  primary_goal text check (primary_goal in ('muscle_gain', 'fat_loss', 'general_fitness', 'strength')),
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  workout_frequency_days smallint check (workout_frequency_days between 1 and 7),
  injuries_limitations text,
  preferred_workout_types text[] not null default '{}',
  preferred_duration_minutes smallint check (preferred_duration_minutes in (30, 45, 60, 90)),
  training_time_preference time,
  rest_days text[] not null default '{}',
  ai_feedback_intensity text not null default 'moderate'
    check (ai_feedback_intensity in ('gentle', 'moderate', 'intense')),
  ai_voice_feedback_enabled boolean not null default false,
  ai_voice_volume smallint not null default 70 check (ai_voice_volume between 0 and 100),
  language_preference text not null default 'en',
  ai_coaching_style text not null default 'balanced'
    check (ai_coaching_style in ('motivational', 'technical', 'balanced')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'App-specific profile data, one row per auth.users row.';

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.users enable row level security;

create policy "users_select_own"
  on public.users for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users_update_own"
  on public.users for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ---------------------------------------------------------------------------
-- exercises (shared catalog, read-only to clients — seeded via service role)
-- ---------------------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  muscle_groups text[] not null default '{}',
  equipment text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  instructions text,
  image_url text,
  video_url text,
  -- fitness.* feature string from QuickPose's Exercises doc; null if the
  -- exercise has no supported pose-tracking feature.
  quickpose_feature text,
  created_at timestamptz not null default now()
);

alter table public.exercises enable row level security;

create policy "exercises_select_all"
  on public.exercises for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- workouts (user-owned routines/templates)
-- ---------------------------------------------------------------------------
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes smallint,
  scheduled_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workouts_user_id_idx on public.workouts (user_id);
create index workouts_scheduled_date_idx on public.workouts (scheduled_date);

create trigger set_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

alter table public.workouts enable row level security;

create policy "workouts_select_own"
  on public.workouts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workouts_insert_own"
  on public.workouts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workouts_update_own"
  on public.workouts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workouts_delete_own"
  on public.workouts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- workout_exercises (join table: which exercises make up a workout)
-- ---------------------------------------------------------------------------
create table public.workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  order_index smallint not null default 0,
  sets smallint,
  reps smallint,
  duration_seconds integer,
  rest_seconds integer
);

create index workout_exercises_workout_id_idx on public.workout_exercises (workout_id);

alter table public.workout_exercises enable row level security;

create policy "workout_exercises_select_own"
  on public.workout_exercises for select
  to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = (select auth.uid())
  ));

create policy "workout_exercises_insert_own"
  on public.workout_exercises for insert
  to authenticated
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = (select auth.uid())
  ));

create policy "workout_exercises_update_own"
  on public.workout_exercises for update
  to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = (select auth.uid())
  ));

create policy "workout_exercises_delete_own"
  on public.workout_exercises for delete
  to authenticated
  using (exists (
    select 1 from public.workouts w
    where w.id = workout_exercises.workout_id and w.user_id = (select auth.uid())
  ));

-- ---------------------------------------------------------------------------
-- workout_sessions (a started/completed run of a workout)
-- ---------------------------------------------------------------------------
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  workout_id uuid references public.workouts (id) on delete set null,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'cancelled')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  calories_burned integer,
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now()
);

create index workout_sessions_user_id_idx on public.workout_sessions (user_id);

alter table public.workout_sessions enable row level security;

create policy "workout_sessions_select_own"
  on public.workout_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_sessions_insert_own"
  on public.workout_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_update_own"
  on public.workout_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_delete_own"
  on public.workout_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- chat_messages (AI Trainer Chat history)
-- ---------------------------------------------------------------------------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_user_id_created_at_idx on public.chat_messages (user_id, created_at);

alter table public.chat_messages enable row level security;

create policy "chat_messages_select_own"
  on public.chat_messages for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "chat_messages_insert_own"
  on public.chat_messages for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "chat_messages_delete_own"
  on public.chat_messages for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- pose_sessions (Live Review sessions — QuickPose form-tracking results)
-- ---------------------------------------------------------------------------
create table public.pose_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  workout_session_id uuid references public.workout_sessions (id) on delete set null,
  exercise_id uuid not null references public.exercises (id) on delete restrict,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  total_reps integer not null default 0,
  target_reps integer,
  avg_form_score numeric(5, 2),
  best_rep_score numeric(5, 2),
  feedback_summary text,
  recorded boolean not null default false,
  video_url text,
  created_at timestamptz not null default now()
);

create index pose_sessions_user_id_idx on public.pose_sessions (user_id);

alter table public.pose_sessions enable row level security;

create policy "pose_sessions_select_own"
  on public.pose_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "pose_sessions_insert_own"
  on public.pose_sessions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "pose_sessions_update_own"
  on public.pose_sessions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "pose_sessions_delete_own"
  on public.pose_sessions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
