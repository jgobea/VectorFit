-- Per-day naming: the user wants each day of the week to carry its own
-- identity (e.g. Monday "Chest Day", Tuesday "Triceps Day") instead of one
-- shared name for the whole week. The routines.name column is left in place
-- (still populated as 'My Routine' at creation, same precedent as the dead
-- workouts/workout_exercises tables) but is no longer surfaced anywhere in
-- the UI — routine_days.name is the name that's actually shown now.
alter table public.routine_days add column name text;
