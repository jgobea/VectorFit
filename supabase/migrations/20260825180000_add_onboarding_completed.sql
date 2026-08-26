-- Gates the new first-login onboarding wizard (app/onboarding.tsx). New
-- signups default to false and are routed through the wizard; existing
-- rows are backfilled to true so current users aren't unexpectedly
-- interrupted by a flow that didn't exist when they signed up.
alter table public.users add column onboarding_completed boolean not null default false;

update public.users set onboarding_completed = true;
