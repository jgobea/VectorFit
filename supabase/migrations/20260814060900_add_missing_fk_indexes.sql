-- Performance advisor: cover the remaining foreign keys used in joins/lookups.
create index pose_sessions_exercise_id_idx on public.pose_sessions (exercise_id);
create index pose_sessions_workout_session_id_idx on public.pose_sessions (workout_session_id);
create index workout_exercises_exercise_id_idx on public.workout_exercises (exercise_id);
create index workout_sessions_workout_id_idx on public.workout_sessions (workout_id);
