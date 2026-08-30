# VectorFit — Handoff

**Written:** 2026-08-30. **For:** a fresh Claude Code session continuing this
build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and
`DESIGN_SPEC.md` (the design source of truth) at the project root — still on
disk, gitignored, don't re-derive their contents here.

## Where things stand

Git: on branch **`chore/expo-sdk-54`** (off `master`). Committed locally as
`910c4e3`, **not yet pushed** — the user hasn't asked for a push this round.
**Still not merged to `master`** — this has been flagged in every handoff for
a while now and still hasn't come up; keep raising it.

Everything below is confirmed working by the user (with one exception,
flagged loudly) and safe to build on. Read `910c4e3`'s commit message for
the full file-level "what" — this doc is the "why" and the gotchas.

## Drag-and-drop exercise reorder

`components/features/routine/DraggableExerciseList.tsx` — replaced the
up/down chevrons in the routine builder with real drag-and-drop, built on
Reanimated + Gesture Handler (both already linked natively — used elsewhere
in the app — so this needed no prebuild).

**This took three attempts before it was right — worth reading if you touch
this file.** All three are relevant if something regresses here:

1. First attempt: every row absolutely positioned, offsets computed from a
   shared `heights` map populated via each row's own `onLayout`. Bug: rows
   overlapped on first open and never self-corrected — turned out
   `useDerivedValue`'s automatic dependency tracking didn't reliably
   propagate through the nested `offsetForPosition` helper reading a
   *different* item's height. Switched to `useAnimatedReaction`.
2. Still visibly stuck. Root cause was actually a render-time read of
   `positions.value`/`heights.value` while initializing a shared value
   (Reanimated strict-mode flags this, and it wasn't as harmless as it
   looked). Fixed, but a bigger bug surfaced next.
3. Real bug: dragging item 1 down in a 3-item list rocketed it to the
   bottom. Cause: `translateY.value = e.translationY` every `onUpdate` frame
   overwrote the previous frame's `-= steps * slot` correction, because
   `e.translationY` is cumulative-since-gesture-start, not a per-frame
   delta — so a single slot-crossing kept re-firing every frame instead of
   once. Fixed with a `consumed` accumulator that persists across the whole
   gesture.

**Final, working architecture**: rows stay in normal flex flow always (Yoga
owns steady-state stacking — impossible to desync, unlike hand-computed
absolute offsets). Reordering mutates a plain `order: string[]` React state
array; `layout={LinearTransition.springify()}` animates the resulting
reflow for passive rows. Only the actively-dragged row gets pulled out
visually via `translateY` (raw, unquantized, always 1:1 with the finger) —
it also renders a dashed "after image" placeholder in its own flex slot
while dragging, and floats the real card above it. The dragged row's own
`layout` transition is disabled while active (`isDragging` state) — letting
Yoga's own reflow-tween fight the manual `translateY` compensation at the
same time is what caused the "cuts/jerky" complaint before this.

## Time-based exercises

Custom exercises can now be measured by duration instead of reps/weight —
e.g. a 30s plank, either counting down to a target or counting up freely.

- `exercises.measurement_type` (`'reps' | 'time'`) + `exercises.time_mode`
  (`'countdown' | 'stopwatch'`, only meaningful when time-based) —
  `supabase/migrations/20260829000000_time_based_exercises.sql`. Set via a
  toggle in the "add your own exercise" flow
  (`components/features/ExercisePickerModal.tsx`).
- `routine_exercises.duration_seconds` already existed in the schema from
  the original routines migration (nobody had wired it up yet) — no new
  column needed there.
- `components/features/routine/ExerciseTimerModal.tsx` — a guided timer
  reached via a clock button in Today's Workout
  (`RoutineExercisePreviewRow.tsx`, alongside the manual check and, for
  QuickPose exercises, the camera button — mutually exclusive with the
  camera since a user-created exercise can never claim `quickpose_feature`).
  Walks every set + the rest between them (not just the first set), then
  marks the exercise done via the same `routine_exercise_completions` table
  Live Review and the manual check use (`useTodayCompletions.ts` grew a
  `complete()` — always-marks-done, unlike `toggle()`). Closing mid-set (or
  mid-rest) now asks for confirmation via the shared `ConfirmModal` first —
  don't let that regress back to a silent discard.
- Today's load-volume stat on the Dashboard already excludes time-based
  exercises correctly with zero extra code — `reps`/`weight_kg` are `null`
  for them and the formula already does `?? 0`.

## Per-day routine naming (replaces the old single routine name)

**User-directed architecture change**: each day of the week now has its own
name (`routine_days.name`, migration
`20260829060000_routine_day_names.sql`) instead of one name for the whole
`routines` row. Monday can be "Chest Day", Tuesday "Triceps Day", etc. —
edited per-day in `RoutineDayEditor.tsx`, shown in Today's Workout and
Upcoming.

- `routines.name` column is still in the DB (still gets `'My Routine'` at
  creation) but is **fully dead** now, same precedent as the `workouts`
  table — nothing reads or writes it anymore. `RoutineBuilderHeader.tsx` is
  now a static "Weekly Routine" title, no editable field.
- **Copy-day already existed** (`DayMenu.tsx` → `CopyDayModal.tsx` →
  `useRoutineDayActions.copyDay`) — this wasn't new work, just discovered
  while doing this. It now also copies the day's name, per explicit user
  choice (asked directly: exercises+name vs. exercises-only).
- Removed the rest-day "Note (optional)" field entirely (`RestDayPanel.tsx`,
  `setDayNotes` action) — explicit user ask, not a refactor side-effect.
  `routine_days.notes` column is still there (dead) but nothing writes it
  from the UI now.
- The day-name `TextInput` commits on an effect **cleanup**, not just
  `onBlur` — switching days (or leaving the screen) with the field still
  focused used to silently drop whatever was typed. The cleanup fires with
  whatever's in a `nameDraftRef` at that moment, so it can't miss a pending
  edit the way blur-only commits could.

## Routine builder: Done vs. back

**User-directed change, reverses the earlier "always autosave" design**
noted in the prior handoff. Per-field writes still autosave immediately
exactly as before (unchanged mechanism) — but now, leaving via the back
arrow or Android's hardware back **reverts** everything changed since the
screen opened, with a confirmation prompt if anything actually differs from
a snapshot taken on entry. Only "Done" keeps edits.

- `app/routine-builder.tsx`: `snapshotRef` captures `routine.days` (deep
  clone) once, the first time it loads. `hasChanges()` fingerprints each day
  and diffs against the snapshot. `BackHandler` is wired so Android's
  hardware back goes through the same confirm-or-silently-leave path as the
  header's arrow, not the default stack-pop.
- `useRoutineDayActions.revertToSnapshot()` — for each day that actually
  differs, restores `name`/`is_rest_day`, then delete-then-reinserts that
  day's `routine_exercises` **with their original ids** (so add / remove /
  reorder / field-edits / icon changes all undo in one shot via the same
  mechanism). Only touched days are reverted, to limit collateral damage
  (see next point) — untouched days aren't re-written at all.
- **Known caveat, not fully solved**: `routine_exercise_completions` has
  `on delete cascade` from `routine_exercise_id`. If a day being reverted
  had an exercise checked off *today* before the edit session started,
  discarding still cascade-deletes that completion row (delete-then-reinsert
  restores the exercise row with the same id, but the completion row itself
  is already gone by then — re-inserting the parent doesn't resurrect it).
  Edge case, flagged rather than solved — a real fix would need a
  diff-based revert instead of delete-all-then-reinsert per touched day.
- Custom exercises created via the picker while editing are **never**
  reverted — creating a catalog exercise is treated as a permanent, separate
  action from this routine's edit session, not part of the draft.

## Chat personalization + model

- `language_preference` is now read into the system prompt
  (`buildProfileContext()` in `supabase/functions/chat/index.ts`) with an
  explicit "reply in X" instruction — not just listed as background
  context, since a personalization *fact* and a *behavioral instruction* are
  different asks of the model. Deployed live.
- Model switched `gemini-flash-latest` → `gemini-flash-lite-latest` — higher
  free-tier daily quota, less exposed to the demand-related 503s that were
  showing up in Edge Function logs. Also deployed live.

## Dashboard

- Header's profile link now shows the user's `avatar_url` inside the circle
  frame instead of always the placeholder icon (`DashboardHeader.tsx`).
- **"Best form score" replaced with "Today's active time"** — the old stat
  saturated at 100 almost immediately (QuickPose's score is closer to
  binary correct/incorrect per rep than a real 0–100 scale) and was
  useless. New stat sums today's `pose_sessions` durations. Fixed a real bug
  while at it: `usePoseSession.ts`'s insert never set `started_at`
  explicitly, so it defaulted to `now()` at insert time — landing within
  milliseconds of `ended_at` and making every session's duration read as
  ~0. Now captured via a ref at session mount. Old sessions (before this
  fix) still have bogus near-zero durations; nothing retroactive was done
  about that.
- "Workouts this week" now shows `X/goal` (goal = `workout_frequency_days`)
  instead of a bare count — matches the pattern `AchievementSection` already
  used.

## Smaller fixes this session

- Sets can no longer be left blank or below 1 — `CompactNumberField` grew a
  `required` prop that snaps back to `min` on blur instead of leaving `null`
  committed (typing/backspacing mid-edit still works; only the *committed*
  value is guaranteed non-empty).
- 7-day selector (`DaySelector.tsx`) is `flex-1` per chip now instead of a
  horizontally-scrolling fixed-width row — all 7 days visible without a
  swipe (Saturday was getting cut off).
- `UpcomingRoutineList.tsx` dropped `FlashList` for a plain mapped list —
  rows expand/collapse and rest days are shorter than workout days, so a
  guessed fixed row height either left empty space or clipped content.
- Hand-rolled weekday/month formatting
  (`UpcomingRoutineDayRow.formatDayLabel`, `ProfileHeaderSection.memberSince`)
  instead of `toLocaleDateString(undefined, {...})` — Hermes's `Intl`
  support is incomplete for some device locales and was silently dropping
  the month name (reported: "jue, 3 de" with nothing after "de"). If you see
  another spot using `toLocaleDateString` with a `month` option, it has the
  same latent bug.
- `stores/uiStore.ts`'s `applyTheme()` now also calls
  `SystemUI.setBackgroundColorAsync()` (native root window background was
  never set, defaulting to Android's own theme default) — a real gap, not
  just theoretical, though it didn't turn out to be the fix for the
  bottom-of-screen gray box below.
- `app/(app)/_layout.tsx`'s `tabBarHideOnKeyboard` now gates on
  `useIsFocused()` — it was firing (and animating the hidden tab bar)
  whenever a keyboard opened on *any* screen stacked on top of the Tabs
  group, like the routine builder, since react-navigation keeps that
  navigator mounted underneath for gesture-back. This was a real, confirmed
  bug worth keeping fixed regardless of the next item.

## Known unresolved bug: gray box at the bottom of the screen on keyboard open/close

**Reported by the user in the routine builder, not fixed despite three
attempts this session — flagged loudly so the next session doesn't repeat
the same dead ends.** Symptom (with screenshots): after the keyboard
opens/closes while editing a text field, an empty gray rectangle sits at
the bottom of the screen, roughly where the bottom nav area is, without any
icons in it. User's own theory (plausible, not confirmed): it's the app's
*own* bottom tab bar — still mounted underneath the routine builder (which
is outside the `(app)` Tabs group) — reacting to the keyboard and animating
even though it's not visually reachable.

Tried, in order, **none of which fixed it**:
1. `SystemUI.setBackgroundColorAsync` on the native window — kept (real gap
   worth having regardless) but didn't touch this bug.
2. Adding `'bottom'` to the routine builder's `SafeAreaView` `edges` — user
   said it looked the same, not doubled (an earlier read of their feedback
   mis-parsed this as "made it worse" — it didn't, it just didn't help).
   Reverted back to `edges={['top']}` anyway since it wasn't the fix.
3. Gating `tabBarHideOnKeyboard` on `useIsFocused()` (see above) — this is a
   real, independently-justified fix and was kept, but the user reported the
   gray box was still there after it, so it either isn't the cause or isn't
   the *only* cause.

**User's explicit instruction: leave it alone for now, don't keep
guessing.** If picked back up, get a screenshot with the keyboard actually
*open* (not before/after) first — every screenshot so far has been of the
before/after state, not mid-keyboard, which is the one thing that would
distinguish "tab bar ghost" from "Android's own 3-button nav bar
show/hide transition" (a system compositor behavior on edge-to-edge apps
that may not be fixable from app code at all without `expo-navigation-bar`,
a new native dependency requiring a prebuild).

## Decisions carried forward from earlier sessions (still true)

- **NativeWind `className`-no-op footgun** — `Animated.View` and
  `KeyboardAvoidingView` are the two known cases. `className` silently does
  nothing on either; layout classes go on a plain nested `View`/child,
  `style` on the component itself.
- **Android keyboard avoidance needs explicit `behavior={Platform.OS ===
  'ios' ? 'padding' : 'height'}`**, never `undefined` for Android — SDK 54's
  edge-to-edge default breaks the classic `windowSoftInputMode="adjustResize"`
  idiom.
- **`react-native-web` `ScrollView` defaults to `flexGrow: 1`** — any
  horizontal `ScrollView` inside a flex column on web needs explicit
  `grow-0 shrink-0` (+ ideally `max-h-*`) or it silently expands.
- **No third-party Markdown library** — hand-rolled in `lib/markdown.ts` +
  `components/ui/Markdown.tsx`.
- **Expo Go cannot run Live Review at all** — `@quickpose/react-native`
  ships real native code. Everything else still works in Expo Go.
- **Any new native dependency or `app.json` native-identity change needs
  `npx expo prebuild --clean` before `expo run:android`.** Everything this
  session (drag-and-drop, timer, per-day naming, discard/revert) was pure
  JS/TS + migrations — no native changes, all hot-reloaded fine.
- **User-generated-content freedom over admin-curated lists** — from the
  custom-exercises correction a few sessions back. This session's per-day
  naming / copy-day work is in the same spirit: don't assume a fixed
  structure when the user can reasonably want to customize it further.

## Environment quirks (so you don't re-debug them)

- **Windows doesn't reliably kill the whole `expo start` process tree** —
  check `Get-NetTCPConnection -LocalPort 8081 -State Listen` →
  `Stop-Process -Id <pid> -Force` if port 8081 is stuck. Came up twice this
  session.
- **`adb reverse tcp:8081 tcp:8081` drops on USB re-enumeration** — re-run
  it (or `npx expo run:android` if the APK itself needs reinstalling; a
  Metro-only restart is enough if the APK is already on the device and
  nothing native changed).
- **Reading real Supabase Edge Function logs** needs the Management API's
  Logflare endpoint, not `database/query`:
  ```
  POST https://api.supabase.com/v1/projects/{ref}/analytics/endpoints/logs.all
  Authorization: Bearer $SUPABASE_ACCESS_TOKEN
  body: {"sql": "select timestamp, event_message from function_logs order by timestamp desc limit 40",
         "iso_timestamp_start": "<ISO>", "iso_timestamp_end": "<ISO>"}
  ```
  Must pass an explicit timestamp range — omitting it silently returns
  empty, not an error.
- **`python3` resolves to a broken Windows Store stub** — use `node -e
  "..."` one-liners for Management API calls instead.
- **`.env` has real, working project credentials** — don't ask again.
  `SUPABASE_ACCESS_TOKEN` isn't in there — separate personal credential,
  ask fresh each session.
- **User verifies pages themselves** via the running dev server, not a
  headless-screenshot report. **Don't take screenshots yourself.**
- **UIZZE's `ui-radar` is still blocked** (403 from `WebFetch`).

## Next up

1. **Merge decision**: `chore/expo-sdk-54` → `master` — still pending,
   still worth raising.
2. **The gray-box keyboard bug above** — user said leave it for now, but
   it's unresolved and annoying; worth another pass with a mid-keyboard
   screenshot when the user's ready.
3. **Email confirmation is off in production** (`mailer_autoconfirm: true`,
   no custom SMTP) — carried forward from earlier handoffs, still
   unaddressed.
4. **Weight-history graph** (`DESIGN_SPEC.md` §E.2) still not built.
5. The `routine_exercise_completions` cascade-delete-on-revert caveat
   (under "Routine builder: Done vs. back" above) — low priority, real, not
   fixed.
6. Consider whether `revertToSnapshot`'s per-day
   delete-then-reinsert-with-original-ids approach should become a real
   diff-based patch instead, if the completions-cascade caveat ever
   actually bites someone.

## Suggested skills for the next session

- `supabase` — re-check the security checklist: `exercises.measurement_type`
  /`time_mode`, `routine_days.name` are new columns since the last check;
  RLS itself didn't change but worth confirming nothing regressed.
- `ui-slop-score` / `anti-ui-slop` — the routine builder is now the most
  interaction-heavy screen in the app (drag-and-drop, per-day naming,
  discard confirmation, copy-day) and still hasn't had this pass.
- `handoff` — if the next session also runs long, produce another one (read
  `~/.claude/.agents/skills/handoff/SKILL.md` directly, not invokable via
  the `Skill` tool). This project's convention is a single living
  `HANDOFF.md` at the repo root (git-tracked), not the skill's generic
  temp-directory default.
