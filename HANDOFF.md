# VectorFit — Handoff

**Written:** 2026-08-30. **For:** a fresh Claude Code session continuing this
build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and
`DESIGN_SPEC.md` (the design source of truth) at the project root — still on
disk, gitignored, don't re-derive their contents here.

## Where things stand

Git: **on `master`** now — `chore/expo-sdk-54` was merged (fast-forward, no
conflicts) and pushed to `github` (the real GitHub remote). This session's own
work landed as four more commits on top, also pushed to `github`:
`87c7e67`, `dc2c5c0`, `1899064`, `b016c72`.

There's a second git remote, `origin`, pointing at a **local filesystem
path** (`C:/Users/david/supa/tesis/VectorFit` — a separate working copy on
the same machine, not GitHub). Pushing to it fails
(`! [remote rejected] master -> master (branch is currently checked out)`)
because that copy has `master` checked out itself — normal git behavior for a
non-bare repo, not a bug. Only `github` gets pushed; if that other local copy
needs to catch up, it has to `git pull` on its own.

## Gotcha worth its own paragraph: `npx expo install <pkg>` can silently break another package

Installing `expo-audio` this session bumped `expo-asset` (a transitive dep,
not something we depend on directly) to `57.0.15` — nothing close to what
Expo SDK 54 actually ships (`expo-asset@~12.0.13`, per
`node_modules/expo/bundledNativeModules.json`). `expo-audio`'s own
`package.json` just has a loose/unpinned range on `expo-asset` that npm
resolved to latest-on-npm instead of SDK-compatible. Compiled fine (`BUILD
SUCCESSFUL`), then crashed on launch:
`NoClassDefFoundError: Lexpo/modules/kotlin/types/AnyTypeCache` — a class
that only exists in a much newer `expo-modules-core` than SDK 54 ships,
because the mismatched `expo-asset` was compiled against one.

Fixed with an npm `overrides` entry pinning `expo-asset` to `~12.0.13`
project-wide (see `package.json`). **After installing any new
`expo-*` package, run `npm ls <suspicious-transitive-dep>` and diff against
`bundledNativeModules.json` before assuming the install is clean** — a
successful Gradle build does not mean the versions are compatible; this one
built fine and crashed instantly on open.

## Native deps added this session

- **`expo-audio`** — a short "ding" (`assets/sounds/rep_beep.wav`, synthesized
  locally, not downloaded) plays on every rep QuickPose counts, in
  `hooks/usePoseSession.ts`.
- **`expo-speech`** — reads the Live Review coach note aloud (see below) if
  the user has Voice Feedback on in Profile. `users.ai_voice_feedback_enabled`
  / `ai_voice_volume` existed in the schema since the very first migration
  but nothing consumed them until now.
- Both needed a real native rebuild (`npx expo run:android`) — Metro alone
  isn't enough for a new native module, same as any earlier native addition.
- **`react-native-gifted-charts`** (for the new Progress page, below) is
  *not* in this category — it's pure JS/SVG (`react-native-svg`, already
  linked), no native code of its own. Hot-reloaded fine.

## New: Live Review AI coach feedback

`supabase/functions/live-review-feedback/` (new Edge Function, separate from
`chat` — single-shot, not persisted to `chat_messages`). Deployed live.

- **The form score is not a quality signal — don't feed it to a coach
  prompt.** `QuickPoseThresholdCounter`'s driving value sweeps 0→100→0 every
  single rep by design (it's a range-of-motion/completion metric, not
  correctness), so an "average form score" stays high even with bad form.
  The actual per-rep quality signal QuickPose exposes is its `feedbacks[...]`
  *strings* (e.g. "keep your back straight") — `usePoseSession.ts` now tal
  lies how often each distinct string fires per set and sends the top 5 to
  the coach.
- **Camera-framing feedback ("stay in frame", "step back", "keep both arms
  visible") fires very often even when the person is clearly fully visible**
  (confirmed: reps still counted correctly) — almost certainly a tracking-
  confidence artifact, not a real problem. The system prompt explicitly
  tells the model to treat this category as noise: never lead with it, skip
  it entirely if any genuine form correction also fired that set, only
  mention it if it's the *sole* thing that fired *and* reps came in well
  under target.
- The request carries `isWorkoutComplete` so the prompt doesn't say "for
  your next set" after the workout (or an early Stop) actually ended — that
  bug shipped once and was reported before this fix.
- Fires on every set end now, not just inter-set rest — `finishWorkout` (not
  only `finishSet`) requests a note too, so single-set exercises and the
  final set (neither of which have a rest period) still get one, shown on
  the redesigned `SessionSummaryModal` (now a centered, bigger dialog instead
  of a small bottom sheet).
- `LiveReviewBottomPanel`'s "no feedback this frame" fallback text no longer
  reads as a tracking failure once tracking has actually started — QuickPose
  sending nothing means "nothing to fix," not "I can't see you." (This was
  the user's literal on-screen text, confirmed by asking them to read it
  back — worth remembering as a diagnostic technique: when a live SDK's
  behavior is in question, get the *exact* on-screen string before theorizing.)

## New: Progress page (`app/progress.tsx`)

Wired up Home's "View Progress" tile, previously a "coming soon" stub.
Lifetime stats, a 14-day consistency strip, weekly workout-frequency + form-
score-trend charts, and a training-focus donut by body area
(`hooks/useProgressStats.ts`, from `routine_day_completions` +
`pose_sessions` — the same real sources Dashboard/Profile use, nothing new).

**gifted-charts gotcha**: `actualContainerWidth = width + yAxisLabelWidth`
(default `yAxisLabelWidth` is 35) — passing the card's full available width
as `width` overflows the card by 35px on the right. Subtract it. Also: week
labels need to be short ("8/24", not "Aug 24") or they truncate to "Aug…" —
there isn't a separate x-axis-label-width prop to widen, only the bar/
spacing geometry controls how much room each label gets.

## New: Terms & Privacy + signup validation

- `app/terms.tsx` + `content/legalContent.ts` — a reading screen linked from
  Login and required (checkbox) before Sign Up can submit. The root
  `terminos_y_privacidad.md` is kept as the human-editable source (it has
  Google-Docs-export artifacts, `\#`/`\*\*`, not meant to render as-is) —
  `content/legalContent.ts` is a hand-ported clean copy; there's no build
  step syncing them, so **edit both if the legal text changes**.
- Signup now has the same inline email/password validation as Login
  (`EMAIL_REGEX`, min-6-char password, confirm-match), shown on blur.

## Removed: Profile's Preferences section

Workout types / session length / preferred time / rest days — nothing read
or wrote these (onboarding never collected them either). Deleted the
component and dropped the matching four columns from `public.users` via
`supabase/migrations/20260830100000_drop_unused_profile_preferences.sql`,
already applied live. If you're looking for where a user's workout-type
preference lives, it doesn't — that idea was fully removed, not renamed.

## Profile edit mode: sticky footer + discard confirmation

Cancel/Save Changes now sit in a footer that stays visible while scrolling
(the page had gotten long) instead of scrolling away right after the header.
`useProfile.ts` grew `hasUnsavedChanges` (plain `JSON.stringify(draft) !==
JSON.stringify(profile)` — every field is a primitive now that Preferences'
array fields are gone, so this is reliable without a per-field diff). Cancel,
the header's pencil/X toggle, and Android's hardware back all route through
one `requestCancel()` that only shows the discard-confirmation modal when
something actually changed.

## Bottom tab bar: floating pill (`app/(app)/_layout.tsx`)

Changed from an edge-to-edge bar to a floating rounded pill, in three
iterations — **read this before touching `tabBarStyle` again**:

1. First attempt: `marginHorizontal`/`marginBottom`/`borderRadius` on
   `tabBarStyle` *without* `position: 'absolute'`. Looked rounded but left a
   plain dark-gray rectangle in the gutter around the pill — that reserved-
   space container belongs to React Navigation internally and isn't
   recolorable via `tabBarStyle`.
2. Switched to `position: 'absolute'`, which removes that reserved-space
   container entirely (the pill now floats directly over each screen's own
   background). This requires every `Tabs.Screen`'s scrollable content to
   pad its own bottom via `useBottomTabBarHeight()` — otherwise the last
   content item (or, on Chat, the message input itself) ends up hidden
   behind the pill. Also surfaced: the pill's own internal bottom padding
   (React Navigation adds `insets.bottom` inside the bar unconditionally)
   made its rounded background tall enough to visually extend into the
   phone's own 3-button nav row.
3. Final fix: `safeAreaInsets={{ bottom: 0 }}` on `<Tabs>` itself (a
   Navigator-level prop, not inside `screenOptions`) zeroes out that
   internal padding; the real inset is applied exactly once, to the pill's
   own `bottom` position (`insets.bottom + 6`), via `useSafeAreaInsets()`.
   Zeroing that inset also made the bar's *height* fall back to Navigation's
   bare default (49px, `TABBAR_HEIGHT_UIKIT` in their source) — set an
   explicit `height: 68` to compensate, since a custom `height` in
   `tabBarStyle` fully overrides their calculation.

Every `Tabs.Screen` (`dashboard.tsx`, `chat.tsx`, `profile.tsx`,
`LiveReviewSetup.tsx`) now does `useBottomTabBarHeight() + useSafeAreaInsets
().bottom + <gap>` for its bottom padding — both halves are needed since the
height hook no longer includes the inset. If you add a fifth tab screen (or
a new scrollable section on an existing one), copy this pattern.

## Known unresolved bug: gray box at the bottom of the screen on keyboard open/close

**Carried forward from the previous handoff, still not fixed, not
revisited this session.** Reported in the routine builder: an empty gray
rectangle appears at the bottom of the screen after the keyboard opens/
closes, roughly where a nav bar would be. Three prior fix attempts (native
window background color, `SafeAreaView` bottom edge, gating
`tabBarHideOnKeyboard` on focus) didn't resolve it — full history is in git
log around commit `9c0548a` if it's picked back up.

**Worth knowing before the next attempt**: the bottom tab bar's whole
positioning model changed this session (in-flow → floating/absolute, see
above). That could plausibly change this bug's behavior or root cause
entirely — don't assume the old investigation's conclusions still apply
without re-observing it first. Get a screenshot with the keyboard actually
*open* (not before/after) — that's the one thing that would distinguish
"our own tab bar" from "Android's own 3-button nav bar transition," and it
was never captured.

## Decisions carried forward (still true)

- **NativeWind `className`-no-op footgun** — `Animated.View` and
  `KeyboardAvoidingView` don't register `className`; layout classes go on a
  nested plain `View`, `style` on the component itself.
- **Android keyboard avoidance needs explicit
  `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`**, never
  `undefined` — SDK 54's edge-to-edge default breaks
  `windowSoftInputMode="adjustResize"`.
- **`routine_exercise_completions` cascade-delete-on-revert caveat** (routine
  builder's Done-vs-back snapshot/revert) — still real, still not fixed, low
  priority. See prior handoff history if it ever actually bites someone.
- **Expo Go cannot run Live Review** — `@quickpose/react-native` ships real
  native code.
- **User verifies pages themselves** via the running dev server, never a
  screenshot report from Claude.

## Environment quirks (so you don't re-debug them)

- **After any `npm install` (including `npx expo install`), restart Metro
  with `--clear`.** A Metro instance that was already running when
  `node_modules` changed underneath it throws stale
  `Unable to resolve "./someFile"` bundling errors for files that actually
  exist on disk — looks like a real missing-file bug, isn't one. Came up
  twice this session.
- **Windows doesn't reliably kill the whole `expo start` process tree** —
  `Get-NetTCPConnection -LocalPort 8081 -State Listen` →
  `Stop-Process -Id <pid> -Force` if port 8081 is stuck.
- **`adb reverse tcp:8081 tcp:8081` drops on USB re-enumeration** — re-run it
  (full adb path this session:
  `$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe`, not on PATH in the
  Bash tool's shell).
- **`.env` has real, working project credentials** — don't ask again.
  `SUPABASE_ACCESS_TOKEN` isn't in there — separate personal credential, ask
  fresh each session. Project ref: `wyfxwvdzqnylevwypony`.
- **`python3` resolves to a broken Windows Store stub** — use `node -e "..."`
  one-liners for Supabase Management API calls instead.

## Next up

1. **The gray-box keyboard bug** — unresolved, see above; the tab bar's new
   floating/absolute positioning may have changed its behavior, worth a
   fresh look with a mid-keyboard screenshot.
2. **Email confirmation is off in production** (`mailer_autoconfirm: true`,
   no custom SMTP) — carried forward from earlier handoffs, still
   unaddressed.
3. **Weight-history graph** (`DESIGN_SPEC.md` §E.2) — still not built; the
   new Progress page covers workout/form-score trends but not this.
4. The `routine_exercise_completions` cascade-delete-on-revert caveat, and
   whether `revertToSnapshot` should become diff-based instead — still
   pending, low priority.
5. `origin` (the local-path git remote) is behind — not urgent, but if that
   other working copy is actually in use, it needs a manual `git pull`.
