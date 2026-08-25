-- Body-area category for each exercise seeded in 20260818210000 — used to
-- group the Live Review exercise picker (Upper Body / Lower Body / Core /
-- Full Body), a standard fitness taxonomy, not QuickPose-specific.
update public.exercises set category = 'Lower Body' where name in
  ('Squats', 'Sumo Squats', 'Lunges', 'Glute Bridge', 'Hip Abduction Standing', 'Side Lunges');

update public.exercises set category = 'Upper Body' where name in
  ('Push Ups', 'Cobra Wings', 'Overhead Dumbbell Press', 'Lateral Raises', 'Front Raises', 'Bicep Curls');

update public.exercises set category = 'Core' where name in
  ('Sit Ups', 'Plank', 'Leg Raises', 'V-Ups', 'Knee Raises Bilateral');

update public.exercises set category = 'Full Body' where name in
  ('Jumping Jacks');
