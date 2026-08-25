# VectorFit — Handoff

**Written:** 2026-08-25. **For:** a fresh Claude Code session continuing this
build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and
`DESIGN_SPEC.md` (the design source of truth) at the project root — still on
disk, gitignored (see prior handoff entries), don't re-derive their contents
here.

## Where things stand

Git: on branch **`chore/expo-sdk-54`** (off `master`), pushed to the
`github` remote. Working tree clean after this session's commits (see log
for exact SHAs — not repeated here, `git log` is authoritative). **Still not
merged to `master`** — same reasoning as before: this branch also carries
the SDK 54 downgrade from an earlier session, and Live Review (this
session's main work) hasn't had a design self-review pass or explicit user
approval yet, even though it's functionally confirmed working. Ask the user
before merging.

**Setup phase, Login, Dashboard, Trainer AI Chat:** unchanged structurally
this session — Chat got bug fixes only (see below), not a rebuild.

## What changed this session: Trainer AI Chat fixes, then Trainer AI Live Review built

### Trainer AI Chat — three bug fixes, already deployed live

1. **Streaming was silently broken on native** (worked on web). RN's global
   `fetch` doesn't expose a real `ReadableStream` on `response.body` on
   native — `lib/gemini.ts` was throwing `Chat request failed with status
   200` (i.e. the request succeeded but `response.body` was falsy). Fixed
   by importing `fetch` from `expo/fetch` instead of the RN global — it's
   Expo's WinterCG-compliant fetch, which does support streaming on native.
   Confirmed via `https://docs.expo.dev/versions/v54.0.0/sdk/expo/`
   (AGENTS.md requires reading versioned SDK docs before writing code).
2. **Intermittent 502s** turned out to be Gemini itself returning `503
   Service Unavailable — high demand` for `gemini-flash-latest`. Diagnosed
   by pulling real Supabase Edge Function logs via the Management API (see
   Environment quirks below for the query pattern) — the function's own
   `console.error` had the actual Gemini error, which a plain "status 502"
   report from the client never showed. Added `supabase/functions/chat/retry.ts`
   (`withRetry`, 3 attempts, short backoff) — helps but doesn't fully absorb
   sustained demand spikes.
3. **Switched model** `gemini-flash-latest` → `gemini-flash-lite-latest`
   (still an alias, not a dated snapshot — same rationale as the existing
   code comment). The user found via Google AI Studio that flash-lite has a
   much higher free-tier daily request quota than flash, which was close to
   exhausting. Verified the model exists via Gemini's `ListModels` API
   before using it — never guessed.

All three deployed via `supabase functions deploy chat --project-ref
wyfxwvdzqnylevwypony` — each deploy needs the user's explicit go-ahead (the
auto-mode classifier blocks it outright) and a fresh `SUPABASE_ACCESS_TOKEN`
if you don't already have one in the conversation.

### Trainer AI Live Review — built, two real bugs found and fixed, one known unfixable limitation remains

Read `DESIGN_SPEC.md` §D and the QuickPose docs
(`https://docs.quickpose.ai/docs/MobileSDK/...`) before touching any of
this — same as always. The 18-exercise Exercises doc 404s on WebFetch; the
user keeps a working link list — ask them for it if you need it again
(their `links.txt` at the project root, gitignored, not something you can
regenerate from a public URL).

**What was built**, deliberately expanded past `DESIGN_SPEC.md`'s literal
description per explicit user request (a giant single-screen exercise list
wasn't "friendly"):

- `app/(app)/live-review.tsx` — thin shell: physical-device gate, then
  `LiveReviewSetup` (no config chosen) or `LiveReviewWorkout` (config
  chosen).
- `components/features/live-review/LiveReviewSetup.tsx` — exercise picked
  via a dropdown-style modal (`ExercisePickerModal.tsx`, backed by
  `hooks/useExerciseCatalog.ts`), reps/sets/rest picked via button chips
  (`OptionButtonRow.tsx`) — no free-text input anywhere, per the user's
  explicit ask.
- `components/features/live-review/LiveReviewWorkout.native.tsx` /
  `.web.tsx` — the actual multi-set workout: session → rest → next set →
  ... → summary. `hooks/usePoseSession.ts` owns the QuickPose result stream
  and per-set tallies for the whole workout. `targetReps` is a threshold
  that surfaces a "Finish Set" button, not a hard cap — reps keep counting
  past it (explicit user request, for training to failure).
- `supabase/migrations/20260818210000_seed_exercises.sql` — seeded 18
  QuickPose-supported exercises into the (previously-empty)
  `exercises` table, since the Live Review picker needs real rows to show.
  Applied directly via the Management API (same pattern as always — see
  Environment quirks) and backfilled into
  `supabase_migrations.schema_migrations` by hand. `overarmReachBilateral`
  deliberately excluded — QuickPose's own docs mark it iOS-only.
- The `.native.tsx`/`.web.tsx` split exists because
  `@quickpose/react-native`'s native view uses `codegenNativeComponent`,
  which crashes Metro's **web** bundle at import time (not just at
  runtime) — any file that imports anything from that package, even just
  `QuickPoseThresholdCounter`, pulls in the same broken import
  transitively, since it's all one module entry point. Only `import type`
  (fully erased) is safe on the web side. Added
  `"moduleSuffixes": [".ios", ".android", ".native", ".web", ""]` to
  `tsconfig.json` so `tsc` resolves these the same way Metro does (wasn't
  needed before this — first cross-platform split in the project). ESLint's
  import resolver still doesn't know about it — there's an
  `eslint-disable-next-line import/no-unresolved` on the one cross-boundary
  import in `live-review.tsx`, don't remove it.

**Bug #1 — wrong package name.** `app.json`'s `android.package` was still
Expo's auto-generated `com.anonymous.VectorFit` placeholder (nobody had set
it before this session — Chat/Dashboard/Login never needed a real native
identity since they ran fine in Expo Go). The user's QuickPose SDK key is
registered to `com.vectorfit.app` specifically. Mismatch caused the SDK to
initialize locally (camera + skeleton overlay worked for ~1s) then fail an
async license check with "SDK key invalid" rendered right into the
feedback-text overlay. Fixed by setting `android.package` and
`ios.bundleIdentifier` to `com.vectorfit.app` in `app.json` — **but this
requires `npx expo prebuild --clean` to regenerate the native `android/`
folder**, not just a rebuild; `expo run:android` alone does NOT re-read
`app.json` once `android/` already exists on disk. Learned this the hard
way — if `app.json`'s native-identity fields ever change again, prebuild
first.

**Bug #2 — real native crash, not the ANR it looked like at first.**
Tapping "Finish Set" or "Stop Session" after doing actual reps crashed the
app (`SIGABRT`, `JNI DETECTED ERROR ... GetObjectClass called with pending
exception org.json.JSONException: Forbidden numeric value: NaN`). Root
cause, found via `adb logcat -b crash`: QuickPose's own
`QuickPoseViewManager.kt` (line ~199, shipped as source in
`node_modules/@quickpose/react-native/android/...`, not a compiled AAR —
patchable) calls `org.json.JSONObject.put(key, result.value.toDouble())`
without checking for `NaN`. QuickPose's pose math legitimately produces
`NaN` for a frame sometimes (an indeterminate angle mid-movement) — more
reps done live means more chance of hitting one. `org.json` throws on
NaN/Infinite by spec, and that exception surfaces inside a native JNI
callback (`mediapipe::android::Graph::CallbackToJava`) that doesn't clear
it before further JNI calls, aborting the whole process. **Patched** via
`patch-package` (`patches/@quickpose+react-native+0.6.1.patch`,
`postinstall: patch-package` added to `package.json`) to skip non-finite
values instead of crashing. This is a real upstream QuickPose bug, not an
app bug — worth filing with them (`npx patch-package @quickpose/react-native
--create-issue` was offered but not run). **Re-apply note:** since this
patches a *source* file that Gradle compiles locally (not a prebuilt
binary), any `npm install` that reinstalls the package needs `postinstall`
to actually run — if you ever see the crash again, check the patch applied
(`node_modules/@quickpose/react-native/android/.../QuickPoseViewManager.kt`
around line 199 should have an `isFinite()` guard) before re-diagnosing
from scratch.

**Bug #3 — the "unfixable" freeze on exit, fixed anyway.** The prior
version of this handoff described `onViewDetachedFromWindow` /
`onDropViewInstance` both calling `quickPose.stop()` synchronously on the
UI thread (blocking on a native `Graph.nativeWaitUntilGraphDone()` wait,
5+ seconds, ANR territory) as an unavoidable QuickPose limitation — the
call itself is compiled into `quickpose-core`/`quickpose-mp`, not
patchable. That's still true, but the user pushed on it: the *thread*
`stop()` runs on is decided by the patchable bridge file, not by
`stop()` itself. Patched `QuickPoseViewManager.kt` to fire `stop()` on a
plain background `Thread` instead of inline. First attempt crashed the
whole app immediately — `onViewDetachedFromWindow` and `onDropViewInstance`
both call `.stop()`, and once backgrounded the two calls can race: the
second one hits a graph whose native context the first already tore down
(`IllegalStateException: Invalid context, tearDown() might have been
called`), thrown on a bare `Thread` with no handler, which is fatal for
the whole process. Fixed with a `hasStopped` guard (see
`stopQuickPoseAsync()` in the patch) so `stop()` only ever fires once per
camera session, wrapped in `try/catch` so nothing on that background
thread can take the process down again. **Confirmed working** — full
multi-set workout including "Save Session" exit, no freeze, no crash.

### Setup screen reworked per explicit user request (past what DESIGN_SPEC.md describes)

Once the crash/freeze issues above were fixed and confirmed, the user asked
for a friendlier pre-workout config screen — this is scope DESIGN_SPEC.md
doesn't cover at all, added on direct request, not invented independently:

- Exercise picker is now a bottom-sheet dropdown
  (`components/features/live-review/ExercisePickerModal.tsx`) grouped by
  body area, instead of a full-page list. Groups come from `Exercise.category`
  — seeded via `supabase/migrations/20260825140000_categorize_exercises.sql`
  (Upper Body / Lower Body / Core / Full Body, standard fitness taxonomy,
  not QuickPose-specific — applied directly, same Management API pattern as
  every other migration this project uses).
- `components/features/live-review/NumberStepperField.tsx` — reps/sets are
  now +/- buttons around an integer-only text input (digits stripped via
  regex on every keystroke), not button chips.
- `components/features/live-review/RestSlider.tsx` — rest between sets is
  a `@react-native-community/slider` (new native dependency) in 15s steps,
  label switches to a minutes format past 60s.
- `LiveReviewSetup.tsx` now wraps the whole form in one centered `Card`
  instead of a full-height scroll list.
- `onExit` (Save Session) now does `router.replace('/(app)/dashboard')`
  instead of returning to the Live Review setup screen.

**Two rendering bugs found and fixed during this pass** — worth knowing
about if similar symptoms show up elsewhere in the app:
- `TextInput` digits were visually clipped at the top on Android inside a
  fixed-height box. `text-center` (NativeWind) only affects horizontal
  alignment — needed an explicit `style={{ textAlignVertical: 'center',
  paddingVertical: 0 }}` to override Android's built-in vertical padding.
- The exercise picker sheet cut off abruptly partway down instead of
  reaching its intended height. A NativeWind `max-h-[70%]` on a `View`
  nested inside two `Pressable`s didn't reliably resolve — RN's
  percentage-height resolution through a non-trivial ancestor chain is
  flaky on Android. Replaced with a pixel value computed from
  `Dimensions.get('window').height * 0.7`. If a percentage-based height
  class ever looks wrong again, suspect this same class of bug first.

Adding the slider (a genuinely new native module, unlike the JS-only
tweaks earlier this session) needed `npx expo prebuild --clean` before
`expo run:android` — the first build attempt failed with a Fabric codegen
error (`Props.h` file not found) because the existing `android/` folder
predated the dependency and didn't know to generate its codegen artifacts.
Same lesson as the package-name bug from earlier: any new native
dependency or `app.json` native-identity change needs a fresh prebuild,
not just a rebuild.

### Web preview — broken, cause not found, likely environment-specific

`localhost:8081` in the browser (tested in normal window AND incognito, on
the same machine running Metro) shows a blank white page with **zero**
console output and a Network-tab request to `entry.bundle?platform=web...`
that never gets a status. Meanwhile the exact same URL via `curl` from this
session's shell consistently returns `200` in ~1.5s. Restarting Metro
didn't fix it either. Strong suspicion: the user's VPN intercepting
browser-originated `localhost` traffic specifically (browser
extension/proxy layer, independent of the OS routing table — which showed
LAN traffic correctly bypassing the VPN tunnel when checked). **Not
resolved.** Next session: try a different browser, check the VPN client for
a "bypass localhost" setting, or test with the VPN fully off if the user
can. This is very unlikely to be a code issue — Android and web bundles
both compiled clean every time this was checked.

## Next up

Per `INSTRUCTIONS.md`'s page order, Live Review is page #4. Functionally
confirmed working end-to-end this session (full multi-set workout, no
crashes, no freezes) — **still not formally "approved" per
`INSTRUCTIONS.md`'s workflow** (no design self-review pass done yet, see
Suggested skills). After that:

1. Get explicit approval on Live Review from the user before treating it as
   done — `INSTRUCTIONS.md`'s workflow requires this before moving on.
2. Resolve or shelve the web-preview issue — ask the user if it's blocking
   or if they're fine testing exclusively via the Android dev client for
   now.
3. Then: User Info page (page #5, last one in `INSTRUCTIONS.md`'s order).
4. Revisit the `chore/expo-sdk-54` → `master` merge decision — still
   pending, still needs the user's explicit call per earlier handoffs.

## Decisions carried forward from earlier sessions (still true)

- **NativeWind + Reanimated footgun:** `Animated.View` isn't registered
  with NativeWind's `cssInterop`, so `className` on it is silently a
  no-op. Layout classes go on a plain `View` nested inside it; only
  `entering`/`exiting`/`style` go on the `Animated.View` itself.
- **react-native-web `ScrollView` defaults to `flexGrow: 1`.** Any
  horizontal `ScrollView` inside a flex column on web needs explicit
  `grow-0 shrink-0` (+ ideally `max-h-*`) or it silently expands.
- **No third-party Markdown library** — hand-rolled in `lib/markdown.ts` +
  `components/ui/Markdown.tsx`, only wired into assistant chat bubbles.
- **Expo Go cannot run Live Review at all** — `@quickpose/react-native`
  ships real native code (not a config plugin), so it's not in the Expo Go
  binary. A custom dev client (`expo run:android` / `expo run:ios` /
  EAS Build) is required for this page specifically. Login/Dashboard/Chat
  still work fine in Expo Go if that's ever useful again.

## Environment quirks (so you don't re-debug them)

- **Windows doesn't reliably kill the whole `expo start` process tree** —
  same as before, check `Get-NetTCPConnection -LocalPort 8081 -State
  Listen` → `Stop-Process -Id <pid> -Force` if port 8081 is stuck.
- **adb wireless pairing failed repeatedly this session** (`error: protocol
  fault (couldn't read status message): No error`), even with fresh codes
  and an adb server restart — the user has an always-on VPN, plausibly the
  same browser/localhost interception behavior as the web issue above,
  though this was over LAN with a real IP, not localhost, so it might be a
  separate VPN quirk. **USB cable worked fine** — use that, don't burn time
  on wireless pairing with this VPN active. If USB install fails with
  `INSTALL_FAILED_USER_RESTRICTED`, check the phone (Xiaomi/MIUI) for
  Developer Options → **"Install via USB"** — a separate toggle from USB
  debugging, MIUI-specific, easy to miss.
- **`adb reverse tcp:8081 tcp:8081` drops on USB re-enumeration** (cable
  wiggle, phone screen lock/unlock cycles, etc.) — if the app shows
  "Unable to load script" / "Cannot connect to Metro", re-run the reverse
  command before assuming something's actually broken. **Better fix**:
  just re-run `npx expo run:android` — it connects over the phone's LAN IP
  by default (`vectorfit://expo-development-client/?url=http://<LAN-IP>:8081`),
  which doesn't depend on the USB reverse tunnel at all and survived
  reconnects that broke the manual `adb reverse` approach.
- **Reading real Supabase Edge Function logs** (not just client-side status
  codes) needs the Management API's Logflare-backed query endpoint, not the
  `database/query` one used for SQL:
  ```
  POST https://api.supabase.com/v1/projects/{ref}/analytics/endpoints/logs.all
  Authorization: Bearer $SUPABASE_ACCESS_TOKEN
  body: {"sql": "select timestamp, event_message from function_logs order by timestamp desc limit 40",
         "iso_timestamp_start": "<ISO>", "iso_timestamp_end": "<ISO>"}
  ```
  Table names: `function_edge_logs` for request/status lines, `function_logs`
  for the function's own `console.*` output. **Must pass an explicit
  timestamp range** — omitting it silently returns an empty result, not an
  error, which looks identical to "no logs exist."
- **`patch-package` chokes on Gradle build artifacts inside
  `node_modules/`** if a native module's source got compiled locally
  (`android/build/` inside the package) — `git add` fails with "Filename
  too long" on Windows before the patch is even generated. Delete that
  `android/build/` directory (it's disposable, regenerated on next Gradle
  run) before running `npx patch-package <name>`, don't just add
  `--exclude`, which didn't reliably dodge it in this session.
- **`.env` has real, working project credentials** — don't ask again.
  `SUPABASE_ACCESS_TOKEN` still isn't in there — separate personal
  credential, ask again if needed (a token from earlier this session may
  still be live, but don't assume — ask fresh rather than guessing an old
  value).
- **User verifies pages themselves** via the running dev server, not a
  headless-screenshot report — unchanged from before. Also: **don't take
  screenshots yourself** (no `playwright`/`claude-in-chrome` for viewing
  this app's UI) — the user pastes screenshots when something needs to be
  seen. Reading logs (adb logcat, browser console/network — as text, not
  screenshotted) is fine and expected; it's specifically app-UI
  screenshots that are off-limits.
- **UIZZE's `ui-radar` is still blocked** (403 from `WebFetch`) — same as
  every prior session, don't retry it.

## Suggested skills for the next session

- `ui-slop-score` / `anti-ui-slop` — self-score and fix Live Review's new
  screens (Setup, RestTimer, SessionSummaryModal) before calling the page
  done — this session prioritized getting it *working* over a design
  self-review pass.
- `supabase` — re-check the security checklist now that `pose_sessions`
  writes are live (Live Review's `usePoseSession.ts` inserts on every
  finished workout).
- `handoff` — if the next session also runs long, produce another one
  (read `~/.claude/.agents/skills/handoff/SKILL.md` directly — it's not
  invokable through the `Skill` tool, same note as every prior handoff).
