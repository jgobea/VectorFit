-- Sets can't be 0 — a row with 0 sets isn't a set of the exercise, it's the
-- exercise not being there. Enforced at the DB level too, not just the
-- client (RoutineExerciseCard's CompactNumberField min=1).
alter table public.routine_exercises
  add constraint routine_exercises_sets_positive check (sets is null or sets > 0);
