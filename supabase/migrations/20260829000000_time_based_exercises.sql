-- ---------------------------------------------------------------------------
-- Time-based exercises: a custom exercise can be measured by duration
-- instead of reps (e.g. a plank held for 30s), either counting down to a
-- target or counting up freely (stopwatch, no fixed target). Camera-tracked
-- (QuickPose) exercises stay rep-based only — RLS already forbids a
-- user-created exercise from claiming quickpose_feature, so 'time' rows are
-- never expected to carry one.
-- ---------------------------------------------------------------------------
alter table public.exercises
  add column measurement_type text not null default 'reps' check (measurement_type in ('reps', 'time')),
  add column time_mode text check (time_mode in ('countdown', 'stopwatch'));

alter table public.exercises
  add constraint exercises_time_mode_only_when_time
  check (measurement_type = 'time' or time_mode is null);
