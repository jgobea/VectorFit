-- Seed the shared exercise catalog with the QuickPose-supported exercises
-- used by Trainer AI Live Review. `quickpose_feature` values are the exact
-- `fitness.*` strings from QuickPose's docs (verified per-exercise, not
-- guessed) — see supabase/functions/chat aside, this only touches `exercises`.
-- `overarmReachBilateral` is deliberately excluded: QuickPose's own docs mark
-- it iOS-only (Android support pending), and this catalog needs to work on
-- both platforms.
insert into public.exercises (name, quickpose_feature) values
  ('Squats', 'fitness.squats'),
  ('Push Ups', 'fitness.pushUps'),
  ('Jumping Jacks', 'fitness.jumpingJacks'),
  ('Sumo Squats', 'fitness.sumoSquats'),
  ('Lunges', 'fitness.lunges'),
  ('Sit Ups', 'fitness.sitUps'),
  ('Cobra Wings', 'fitness.cobraWings'),
  ('Plank', 'fitness.plank'),
  ('Leg Raises', 'fitness.legRaises'),
  ('Glute Bridge', 'fitness.gluteBridge'),
  ('Overhead Dumbbell Press', 'fitness.overheadDumbbellPress'),
  ('V-Ups', 'fitness.vUps'),
  ('Lateral Raises', 'fitness.lateralRaises'),
  ('Front Raises', 'fitness.frontRaises'),
  ('Hip Abduction Standing', 'fitness.hipAbductionStanding'),
  ('Side Lunges', 'fitness.sideLunges'),
  ('Bicep Curls', 'fitness.bicepCurls'),
  ('Knee Raises Bilateral', 'fitness.kneeRaisesBilateral');
