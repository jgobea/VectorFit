-- routine_day_completions had select/insert policies but no delete one —
-- useRoutineExerciseActions.addExercise deletes today's completion row when
-- a new exercise is added to an already-finished day, but that delete was
-- silently rejected by RLS (no matching policy = deny), so the "Day
-- Complete" state never actually cleared.
create policy "routine_day_completions_delete_own"
  on public.routine_day_completions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
