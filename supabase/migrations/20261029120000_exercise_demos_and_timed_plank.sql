-- Exercise demonstrations for the 18 Live Review exercises: an animated GIF
-- (public Storage bucket `exercise-demos`, uploaded from the repo's Fotos/
-- folder, one file per exercise named after its i18n key) plus a one-line
-- description. Both reuse columns that existed since the initial schema but
-- were never filled: `image_url` holds the GIF's public URL, `instructions`
-- the English description (the app translates it client-side through
-- exercises.descriptions.* in lib/i18n; the chat Edge Function reads it as
-- context for the coach). Idempotent: safe to re-run.

insert into storage.buckets (id, name, public)
values ('exercise-demos', 'exercise-demos', true)
on conflict (id) do nothing;

with demo (name, file, description) as (
  values
    ('Bicep Curls', 'bicepCurls', 'Lift weights in both hands by bending your elbows and lifting them towards your shoulders.'),
    ('Cobra Wings', 'cobraWings', 'Lift your upper body while lying on your stomach.'),
    ('Front Raises', 'frontRaises', 'Lift weights in both hands in front of your body.'),
    ('Lateral Raises', 'lateralRaises', 'Lift weights in both hands out to the sides of your body.'),
    ('Overhead Dumbbell Press', 'overheadDumbbellPress', 'Lift weights in both hands by bending your elbows and lifting them above your head.'),
    ('Push Ups', 'pushUps', 'Lower and raise your body using your arms.'),
    ('Glute Bridge', 'gluteBridge', 'Lift your hips off the ground while lying on your back.'),
    ('Hip Abduction Standing', 'hipAbductionStanding', 'Lift your leg sideways while standing.'),
    ('Lunges', 'lunges', 'Step forward and bend your knees.'),
    ('Side Lunges', 'sideLunges', 'Step sideways and bend your knees.'),
    ('Squats', 'squats', 'Bend your knees and lower your body.'),
    ('Sumo Squats', 'sumoSquats', 'Squat with your feet wider apart.'),
    ('Jumping Jacks', 'jumpingJacks', 'Jump and spread your legs and arms wide.'),
    ('Knee Raises Bilateral', 'kneeRaisesBilateral', 'Raise your knees while standing.'),
    ('Leg Raises', 'legRaises', 'Raise your legs while lying on your back.'),
    ('Plank', 'plank', 'Hold a straight body position while resting on your forearms and toes.'),
    ('Sit Ups', 'sitUps', 'Raise your upper body while lying on your back.'),
    ('V-Ups', 'vUps', 'Raise your upper body and legs while lying on your back to form a "V" shape.')
)
update public.exercises e
set
  instructions = demo.description,
  image_url = 'https://wyfxwvdzqnylevwypony.supabase.co/storage/v1/object/public/exercise-demos/' || demo.file || '.gif'
from demo
where e.name = demo.name and e.created_by is null;

-- Plank is a hold, not reps: Live Review times it (only while the pose is
-- held) and the routine builder asks for seconds. Existing routine rows
-- that stored reps for it move to a 30s duration.
update public.exercises
set measurement_type = 'time', time_mode = 'countdown'
where name = 'Plank' and created_by is null;

update public.routine_exercises re
set duration_seconds = coalesce(re.duration_seconds, 30), reps = null, weight_kg = null
from public.exercises e
where re.exercise_id = e.id and e.name = 'Plank' and e.created_by is null;
