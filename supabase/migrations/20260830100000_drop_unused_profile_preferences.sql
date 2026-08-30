-- Profile's "Preferences" section (workout types, session length, preferred
-- training time, rest days) was removed per explicit request — nothing in
-- the app reads or writes these anymore (onboarding never collected them
-- either), so the columns go too rather than lingering as dead schema.
alter table public.users
  drop column preferred_workout_types,
  drop column preferred_duration_minutes,
  drop column training_time_preference,
  drop column rest_days;
