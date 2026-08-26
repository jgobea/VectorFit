-- The catalog only had QuickPose-trackable exercises (seeded for Live
-- Review before the routine builder existed) — every routine_exercises
-- "Add Exercise" pick was therefore a camera exercise by accident of data,
-- not by design. Adds common gym exercises with no quickpose_feature so
-- the builder's non-camera / manual-check path actually has something to
-- add.
insert into public.exercises (name, category, muscle_groups, equipment, difficulty, quickpose_feature) values
  ('Bench Press', 'Upper Body', array['chest', 'triceps', 'shoulders'], 'barbell', 'intermediate', null),
  ('Lat Pulldown', 'Upper Body', array['back', 'biceps'], 'cable', 'beginner', null),
  ('Barbell Row', 'Upper Body', array['back', 'biceps'], 'barbell', 'intermediate', null),
  ('Tricep Pushdown', 'Upper Body', array['triceps'], 'cable', 'beginner', null),
  ('Shoulder Press Machine', 'Upper Body', array['shoulders', 'triceps'], 'machine', 'beginner', null),
  ('Deadlift', 'Lower Body', array['hamstrings', 'glutes', 'back'], 'barbell', 'advanced', null),
  ('Leg Press', 'Lower Body', array['quads', 'glutes'], 'machine', 'beginner', null),
  ('Leg Curl', 'Lower Body', array['hamstrings'], 'machine', 'beginner', null),
  ('Calf Raises', 'Lower Body', array['calves'], 'machine', 'beginner', null),
  ('Cable Crunch', 'Core', array['abs'], 'cable', 'intermediate', null),
  ('Russian Twist', 'Core', array['abs', 'obliques'], 'bodyweight', 'beginner', null),
  ('Kettlebell Swing', 'Full Body', array['glutes', 'hamstrings', 'shoulders'], 'kettlebell', 'intermediate', null),
  ('Treadmill Run', 'Cardio', array['legs', 'cardio'], 'machine', 'beginner', null),
  ('Stationary Bike', 'Cardio', array['legs', 'cardio'], 'machine', 'beginner', null);
