-- Drops the single-workout data model that public.routines/routine_days/
-- routine_exercises replaced (see 20260826000000_routines.sql). Confirmed
-- dead before dropping: no code path in the app queries workouts,
-- workout_exercises, or workout_sessions (grep across app/ hooks/
-- components/ found zero references), and all three tables were empty in
-- production (0 rows each).
--
-- pose_sessions.workout_session_id was an optional (nullable, ON DELETE SET
-- NULL) link into this dead model — nothing ever set it, so the column
-- itself goes too rather than lingering as dead schema pointing at a table
-- that no longer exists.
alter table public.pose_sessions drop column workout_session_id;

drop table public.workout_exercises;
drop table public.workout_sessions;
drop table public.workouts;
