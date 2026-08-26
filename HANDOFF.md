# VectorFit — Handoff

**Written:** 2026-08-26. **For:** a fresh Claude Code session continuing this
build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and
`DESIGN_SPEC.md` (the design source of truth) at the project root — still on
disk, gitignored, don't re-derive their contents here.

## Where things stand

Git: on branch **`chore/expo-sdk-54`** (off `master`), pushed to the
`github` remote. **Still not merged to `master`** — ask the user before
merging; it's been the natural point to raise this for a few sessions now
and hasn't happened yet.

All 5 of `INSTRUCTIONS.md`'s original pages (Login, Dashboard, Trainer AI
Chat, Trainer AI Live Review, User Info) are built and confirmed. Since
then the app has grown well past that original scope on direct user
request — routines, onboarding, custom exercises — none of which
`DESIGN_SPEC.md` describes; treat user instructions as authoritative over
the spec for anything built after User Info. **Everything described below
is confirmed working by the user and safe to build on.**

Two commits since the last handoff, both approved:
- `7fcf359` — User Info page, first-login onboarding wizard, persistent
  bottom tab bar, two Android keyboard-avoidance bugs, small UI polish.
- `a43ebda` — the whole routines feature: builder, Today's Workout
  redesign, custom exercises, finish-day flow, stats overhaul.

Read those two commit messages for the full file-level "what" — this doc
focuses on the "why" and the non-obvious gotchas, per this project's
`handoff` skill guidance not to duplicate what's already in the diff.

## Persistent bottom tab bar

`app/(app)/_layout.tsx` is now `<Tabs>` (was `<Stack>`): Dashboard / Chat /
Live Review / Profile, always visible except during an active Live Review
camera session (`stores/uiStore.ts`'s `isLiveReviewActive`, set only once
`config !== null` in `live-review.tsx` — **not** during the setup screen,
which needs the tab bar as its only way out since it has no back/cancel
button of its own).

## First-login onboarding wizard

`app/onboarding.tsx` — top-level route (outside both `(auth)` and `(app)`,
same reasoning as `routine-builder.tsx` below: full-screen flow, no tab
bar). Gated by `app/(app)/_layout.tsx` checking `users.onboarding_completed`
via `hooks/useOnboardingGate.ts`, redirecting to `/onboarding` if false.
Four steps (About You / Body / Goals / Coaching Style), dot pagination,
arrow nav, Next disabled until the current step's required fields are
filled (`isStepComplete` in `app/onboarding.tsx`), Skip triggers a
`ConfirmModal`-style warning about losing AI personalization rather than
silently skipping. Field option lists live in
`constants/profileOptions.ts`, shared with the Profile page so the two
can't drift.

**Email confirmation is currently disabled on the live Supabase project**
(`mailer_autoconfirm: true`, set via the Management API's
`/config/auth` endpoint, explicit user request after hitting
`email rate limit exceeded` while repeatedly testing signup/delete
cycles). This means **anyone can sign up with a fake/unverified email
right now**. Revisit before any real/production use — the user was told
this tradeoff explicitly and accepted it "for now." No custom SMTP is
configured either (`smtp_host: null`), which is *why* confirmation emails
were hitting Supabase's shared-mailer rate limit (2/hour) in the first
place — if confirmation ever gets re-enabled without also adding custom
SMTP, expect the same rate-limit issue to resurface immediately during
testing.

## Chat personalization

`supabase/functions/chat/index.ts` now fetches the caller's `public.users`
row (via the request's own auth-scoped client, RLS-protected, not the
service role) and appends a "here's what you know about this user" block
to the Gemini system instruction — only the fields they've actually filled
in, explicitly told not to recite the list back verbatim. Deployed live.
If the prompt ever needs tuning, `buildProfileContext()` is the one
function to touch.

## Routines — the big feature this session

Users can now build a real weekly routine instead of the dashboard always
being empty. This is a full vertical slice: schema, builder UI, Today's
Workout integration, and a day-completion/stats loop.

### Data model

**One routine per user** (`routines.user_id` is `unique`, not a list —
deliberate simplification, confirmed with the user rather than building
multi-routine management). `routine_days` always has exactly 7 rows per
routine (created alongside it, `day_of_week` 0–6 matching JS
`Date#getDay()`), so day toggles are always an `update`, never an
insert/delete. `routine_exercises` stores **aggregate** sets/reps/weight/
rest per exercise (one row, not one row per set) — also a deliberate
simplification the user confirmed over the alternative (individual
set-rows with warmup/drop types), to avoid a much heavier grid UI for v1.

Migrations, in order: `20260826000000_routines.sql` (core 3 tables),
`20260826120000_routine_exercise_extras.sql` (`icon` column +
`routine_exercise_completions`, dated per-day so a recurring Monday can be
checked off independently each week), `20260827090000_seed_non_quickpose_exercises.sql`
(14 gym exercises with no QuickPose feature — see below for why this
existed at all), `20260827100000_user_custom_exercises.sql`
(`exercises.created_by` + RLS rework), `20260827110000_routine_exercises_sets_positive.sql`
(`check (sets is null or sets > 0)`), `20260827130000_routine_day_completions.sql`
(whole-day completion, distinct from the per-exercise table). All applied
directly via the Management API and backfilled into
`supabase_migrations.schema_migrations`, same pattern as every prior
migration in this project.

**The old `workouts` / `workout_exercises` tables are now dead** — they
modeled a single dated workout (`scheduled_date`), never actually got
populated by any UI, and are fully superseded by `routines`. Left in place
(not dropped) since `workout_sessions.workout_id` still references
`workouts`, but nothing in the app writes to either any more. If you're
ever tempted to build something workout-scheduling-related, check
`routines` first — it's almost certainly what you want, not `workouts`.

### Custom exercises — a real correction mid-session

First pass seeded 14 non-QuickPose exercises (Bench Press, Deadlift, etc.)
as the only way to add a non-camera exercise to a routine. **The user
pushed back on this directly** — a fixed admin-seeded list isn't user
freedom, even if it technically has non-camera options. Fixed by adding
`exercises.created_by` (nullable — null means shared/seeded, non-null
means a specific user's own): RLS now scopes `select` to
`created_by is null or created_by = auth.uid()`, `insert` requires
`created_by = auth.uid() and quickpose_feature is null` (nobody but this
app's own QuickPose integration can verify a real `fitness.*` string, so a
user-created exercise can never claim camera compatibility — enforced at
the RLS level, not just client-side). The picker
(`components/features/ExercisePickerModal.tsx`, moved from
`live-review/` since it's shared now) has an inline "Add your own
exercise" row and shows a "Live Review" badge on compatible exercises,
sorted to the top of each category group — that badge is the actual
mechanism for **identifying** camera-compatible exercises now, not a
separate fixed list. **If a future request implies "the exercise catalog
is fixed/admin-only," push back the same way** — this app's whole point is
user-customizable routines.

### Today's Workout — no more single Start Workout button

Each exercise acts independently now:
- **Live-Review-compatible** (`exercise.quickpose_feature` set): a camera
  button that deep-links into `/(app)/live-review` with `exerciseId`,
  `routineExerciseId`, `reps`, `sets`, `restSeconds` as route params.
  `LiveReviewSetup.tsx` reads these via a `prefill` prop and auto-selects
  the matching exercise once its catalog loads. **Also** gets the same
  manual check button as everything else (the user explicitly asked for
  both — camera exercises aren't only completable via the camera).
- **Everything else**: a manual check toggle, backed by
  `routine_exercise_completions` (dated, per exercise, per day —
  `hooks/useTodayCompletions.ts`).
- Finishing (or stopping) a Live Review session for a routine exercise
  **automatically** checks it too — `usePoseSession.ts`'s `finishWorkout`
  upserts a completion row when `config.routineExerciseId` is set. This is
  the one place both paths (manual check, camera finish) converge on the
  same table.

Once every exercise for the day is checked, a **Finish Day** button
(always visible, disabled until then) opens `FinishDayModal` — confirm the
exercise list, and it writes `routine_day_completions` (one row per user
per day, snapshotting `exercise_count` + `total_load_kg`), fires
`components/ui/ConfettiBurst.tsx` (pure `react-native` `Animated`, no new
native dependency — deliberate, to avoid another prebuild cycle), and
swaps the button for a "Day Complete!" badge.

**Dashboard stats got a real fix, not just a new feature.**
`useDashboardStats.ts` used to compute `workoutsThisWeek` and streak from
`workout_sessions` — a table nothing in the app has ever written to, so
those numbers were silently always 0. Both now read from
`routine_day_completions`, which is real. "Calories burned" (also never
actually computed — the schema has no calorie-estimation logic anywhere)
is replaced with **today's load volume** (`lib/routineLoad.ts`:
`sum(sets × reps × weight_kg)` over today's *completed* exercises) — a
number this app can actually calculate honestly from data it already
tracks. If you see "calories" mentioned anywhere else in the app (there
shouldn't be), that's a leftover to clean up.

### Routine builder (`app/routine-builder.tsx`)

Top-level route (outside `(app)`, same reasoning as onboarding: full
screen, no tab bar), reached from the Dashboard's empty state, the
"Today's Workout" edit pencil, or Quick Access's "Edit Routine" tile —
`useRoutine({ createIfMissing: true })` creates one on the fly if the user
doesn't have one yet. `stores/routineStore.ts` is the single source of
truth both this screen and the Dashboard read/write, so builder edits show
up on the Dashboard on navigating back without a manual refetch (Dashboard
also has a belt-and-suspenders `useFocusEffect` refetch, since it's a
`Tabs` screen that stays mounted).

Field edits (rest/training toggle, notes, sets/reps/weight/rest, icon)
autosave immediately per-field — the sticky "Save Routine" button in the
header is really just "I'm done, go back," not a batch-save, per the
user's own description of the flow.

**No drag-and-drop reorder** — up/down chevron buttons on each exercise
card instead. The user's original spec asked for drag-and-drop; this was a
deliberate simplification to avoid adding a new native dependency
mid-feature. Revisit if the user asks for real dragging later.

**Custom exercise icons**: `constants/exerciseIcons.ts` is a curated list
of 10 Feather glyph names (no literal "dumbbell" exists in Feather) —
`routine_exercises.icon` stores the chosen one, falls back to `activity`
if unset or invalid. `ExerciseIconPickerModal.tsx` is the picker.

## Decisions carried forward from earlier sessions (still true)

- **NativeWind `className`-no-op footgun** — `Animated.View` and
  `KeyboardAvoidingView` are the two known cases in this codebase.
  `className` silently does nothing on either; layout classes go on a
  plain nested `View`/child, `style` (and `entering`/`exiting` for
  `Animated.View`) on the component itself. If a screen looks wrong only
  in ways that suggest a missing `flex: 1`, check for this before
  debugging anything else.
- **Android keyboard avoidance needs explicit `behavior={Platform.OS ===
  'ios' ? 'padding' : 'height'}`**, never `undefined` for Android — SDK
  54's edge-to-edge default breaks the classic
  `windowSoftInputMode="adjustResize"` native-resize idiom. This is now
  the standard pattern across every screen with a `KeyboardAvoidingView`
  in this project (`chat.tsx`, all three `(auth)` screens,
  `onboarding.tsx`'s `OnboardingStepFrame`, `routine-builder.tsx`).
- **`react-native-web` `ScrollView` defaults to `flexGrow: 1`** — any
  horizontal `ScrollView` inside a flex column on web needs explicit
  `grow-0 shrink-0` (+ ideally `max-h-*`) or it silently expands.
- **No third-party Markdown library** — hand-rolled in `lib/markdown.ts` +
  `components/ui/Markdown.tsx`, only wired into assistant chat bubbles.
- **Expo Go cannot run Live Review at all** — `@quickpose/react-native`
  ships real native code, not in the Expo Go binary. A custom dev client
  is required for that page specifically; everything else still works in
  Expo Go.
- **Any new native dependency or `app.json` native-identity change needs
  `npx expo prebuild --clean` before `expo run:android`**, not just a
  rebuild — learned the hard way twice (QuickPose SDK key mismatch,
  `@react-native-community/slider`, `expo-image-picker`). This session's
  routines feature was pure JS + migrations, no native changes, so it
  hot-reloaded without a prebuild.

## Environment quirks (so you don't re-debug them)

- **Windows doesn't reliably kill the whole `expo start` process tree** —
  check `Get-NetTCPConnection -LocalPort 8081 -State Listen` →
  `Stop-Process -Id <pid> -Force` if port 8081 is stuck.
- **`adb reverse tcp:8081 tcp:8081` drops on USB re-enumeration** — re-run
  `npx expo run:android` rather than fighting the manual reverse tunnel;
  it connects over the phone's LAN IP by default and survives reconnects
  the tunnel doesn't.
- **Reading real Supabase Edge Function logs** needs the Management API's
  Logflare endpoint, not `database/query`:
  ```
  POST https://api.supabase.com/v1/projects/{ref}/analytics/endpoints/logs.all
  Authorization: Bearer $SUPABASE_ACCESS_TOKEN
  body: {"sql": "select timestamp, event_message from function_logs order by timestamp desc limit 40",
         "iso_timestamp_start": "<ISO>", "iso_timestamp_end": "<ISO>"}
  ```
  `function_edge_logs` for request/status lines, `function_logs` for the
  function's own `console.*` output. **Must pass an explicit timestamp
  range** — omitting it silently returns empty, not an error.
- **`python3` resolves to a broken Windows Store stub** in this
  environment — use `node -e "..."` one-liners to build JSON payloads for
  Management API calls instead (used throughout this session for every
  migration deploy).
- **`.env` has real, working project credentials** — don't ask again.
  `SUPABASE_ACCESS_TOKEN` isn't in there — separate personal credential,
  ask fresh each session rather than assuming an old one from
  conversation history is still live.
- **User verifies pages themselves** via the running dev server, not a
  headless-screenshot report. **Don't take screenshots yourself** — the
  user pastes them when something needs to be seen. Reading logs (adb
  logcat, console/network as text) is fine; app-UI screenshots are
  specifically off-limits.
- **UIZZE's `ui-radar` is still blocked** (403 from `WebFetch`) — don't
  retry it.

## Next up

1. **Merge decision**: `chore/expo-sdk-54` → `master` — raise it with the
   user, it's been pending for a while and the app has grown a lot on this
   branch since the SDK downgrade that started it.
2. **Email confirmation is off in production right now** — decide with the
   user whether/when to re-enable it plus configure custom SMTP, per the
   note above. Don't just flip it back on without SMTP — the rate-limit
   issue that caused it to be disabled will resurface immediately.
3. **Weight-history graph** (`DESIGN_SPEC.md` §E.2) still not built — the
   schema only stores current `weight_kg` + `weight_updated_at`, no time
   series. Flagged, not scheduled.
4. **Language preference field doesn't do anything yet** — it's a Profile
   field but the `chat` edge function's system prompt build doesn't read
   it. Real gap if the user expects it to work.
5. Consider whether the "no drag-and-drop reorder" simplification in the
   routine builder needs revisiting — flagged above, not requested yet.

## Suggested skills for the next session

- `supabase` — re-check the security checklist given how many new
  tables/RLS policies landed this session (`routines`, `routine_days`,
  `routine_exercises`, `routine_exercise_completions`,
  `routine_day_completions`, plus the `exercises.created_by` RLS rework).
- `ui-slop-score` / `anti-ui-slop` — self-score the routine builder
  specifically; it's the most complex screen in the app now and hasn't had
  this pass yet.
- `handoff` — if the next session also runs long, produce another one
  (read `~/.claude/.agents/skills/handoff/SKILL.md` directly — it's not
  invokable through the `Skill` tool). This project's own convention is a
  single living `HANDOFF.md` at the repo root (git-tracked), not a
  temp-directory file — follow that, not the skill's generic default.
