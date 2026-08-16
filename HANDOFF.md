# VectorFit — Handoff

**Written:** 2026-08-15 (continuation of the same day's session). **For:** a
fresh Claude Code session continuing this build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and `DESIGN_SPEC.md`
(the design source of truth) at the project root — don't re-derive their contents here.

## Where things stand

Git: `master` branch, latest commit `77f3fe2 "fix: signup — return to login
after account creation"`, one before it `719d50a "feat: dashboard —
approved"`, one before that `621635a "feat: login page — approved"`.
Working tree clean. Task tracker is not being used to persist state across
sessions (checked — comes back empty each time), so this file is the source
of truth for progress, not `TaskList`.

**Setup phase + Login page (done):** see `621635a` — unchanged this session,
not re-described here.

**Dashboard page (done, approved, committed in `719d50a`):**
`app/(app)/dashboard.tsx` + `hooks/useDashboard.ts` /
`hooks/useDashboardStats.ts`, `lib/greeting.ts`, `types/dashboard.ts`, and
`components/features/` (`DashboardHeader`, `StatsSummaryCard`,
`TodaysWorkoutSection`, `ExercisePreviewRow`, `UpcomingWorkoutsList`,
`UpcomingWorkoutRow`, `QuickAccessGrid`, `AchievementSection`) +
`components/ui/Card.tsx`. Added `@shopify/flash-list` (v2.0.2) and 3 minimal
stub routes (`chat.tsx`, `live-review.tsx`, `profile.tsx`) so Dashboard's nav
buttons aren't dead ends — same pattern as Login's signup/forgot-password
stubs, **not** run through the full page workflow.

Went through one revision round after the first build: user tested in
responsive mode and flagged the Quick Access grid resizing/re-centering
across breakpoints, asked for the 4 stat cards to collapse into one card
instead of a horizontal scroller, and asked for the vectorFit wordmark in
the header. All three applied — see Decisions below for the specifics and
why, since the *first* version of this page is gone from history (both
commits above are the already-revised version).

**Small unrelated fix also committed (`77f3fe2`):** `app/(auth)/signup.tsx`
now shows a "Back to Login" button after successful account creation
(previously the success state was a dead end).

**Next up (per `INSTRUCTIONS.md`'s page order):** Trainer AI Chat page.
Follow the same Workflow Per Page it defines — read `DESIGN_SPEC.md` §C,
`ui-radar` (see caveat below), build, self-score with `ui-slop-score`, run
`anti-ui-slop`, then **stop for explicit approval** before committing. Don't
build ahead of that gate.

## Decisions made this session worth knowing about

- **User verifies pages by looking at the running dev server themselves**,
  not via a headless-Chrome-screenshot → HTML/artifact report (that's how
  Login was verified last session — see the old artifact link in git history
  if curious). Start `expo start --web` and hand them the URL; don't build a
  report as the deliverable. An internal playwright screenshot check is
  still fine for your *own* sanity-checking before handing back, just not
  the user-facing output.
- **UIZZE's `ui-radar` is blocked in this environment**: both
  `https://uizze.com/api/search` and `/search` return HTTP 403 to `WebFetch`.
  Tried once for the Dashboard, got 403, proceeded straight from
  `DESIGN_SPEC.md` per the skill's own "don't stop useful work when a tool
  is unavailable" guidance. Worth a retry next session in case it's
  transient/environment-specific rather than a hard block.
- **Stats display deviates from `DESIGN_SPEC.md`'s "swipeable/scrollable row
  of 4-6 metric cards"**: user explicitly asked for one single card holding
  all 4 stats in a fixed 2×2 grid instead — no horizontal scroll. This is a
  deliberate override, same category as the earlier dark+light theme
  override — keep it if you touch this component again.
- **Quick Access grid layout bug (now fixed):** it was `flex-wrap` +
  `w-[47%]` items, which resizes/re-centers unpredictably across viewport
  widths because row width and item width are computed independently. Fixed
  to two explicit `flex-row` rows of `flex-1` cards — always identical
  sizing at any width. If you add more grids like this (fixed N×M layouts,
  not truly-dynamic wrapping content), use the same fixed-rows pattern, not
  `flex-wrap` + percentage widths.
- **Dashboard header shows the vectorFit wordmark** (same bold-"vector" +
  light-"Fit" treatment as Login), per explicit user request —
  `DESIGN_SPEC.md`'s dashboard header spec doesn't call for a logo, only
  greeting/bell/profile. Keep the wordmark treatment consistent if it shows
  up on more pages.
- **React 19 footgun hit and fixed:** spreading a data object that has its
  own `key` field directly into JSX props (`<StatCell {...item} />`) throws
  at runtime — a blank-message error, only visible via an actual connected
  browser tab; `tsc`/`eslint` do **not** catch it. Pass props explicitly
  instead of spreading whenever the source object carries a `key` field
  (e.g. anything shaped for a former `keyExtractor`).
- **`eslint-config-expo`'s React Compiler preset includes
  `react-hooks/set-state-in-effect`**, which flags a plain fetch-on-mount
  effect (`useEffect(() => { load(); }, [load])` where `load` is async and
  calls setState after its awaits) even though nothing runs synchronously.
  This is a known-noisy false-positive for the standard "fetch data in an
  effect" pattern React's own docs endorse. Resolved with a targeted
  `eslint-disable-next-line` + comment in `hooks/useDashboard.ts` rather
  than restructuring away from a normal data-fetching hook. Expect to hit
  this again on the Chat/Live Review pages' data hooks — same fix applies.
- **"Personal Best" stat** (`DESIGN_SPEC.md` §B.2) has no dedicated schema
  column — defined as `max(pose_sessions.best_rep_score)`, the closest real
  field. **Achievement badges** (§B.6) are derived live from real stats
  (streak / weekly-goal-hit / has-a-best-score) rather than invented, since
  there's no badges table.
- **`@shopify/flash-list` v2.0.2** installed for the `FlashList` requirement
  — v2 doesn't need `estimatedItemSize` (auto-sizing). Used with
  `scrollEnabled={false}` for the two small in-page lists (today's
  exercises, upcoming workouts) since they need to flow inside the page's
  own vertical `ScrollView` rather than scroll independently.

## Environment quirks (so you don't re-debug them)

- **Direct Postgres access is unreachable from this sandbox** (IPv6-only
  hostname, no route out) — use the Management API pattern from the setup
  session if you need more schema changes: `POST
  https://api.supabase.com/v1/projects/{ref}/database/query` with
  `Authorization: Bearer $SUPABASE_ACCESS_TOKEN` (you'll need to ask the
  user for a fresh token — none is stored in the repo), then backfill
  `supabase_migrations.schema_migrations` by hand.
- **`.env` has real, working project credentials** already filled in — don't
  ask again. Correctly gitignored.
- **Expo dev server cold bundles are slow here** — up to ~5 min for a clean
  `expo start --web`. A short `curl` timeout is not proof it's broken; check
  the log file and `Get-Process node` CPU before concluding something
  crashed. Once it's up, Fast Refresh on subsequent edits is fast (seconds).
- **No `chromium-cli`.** For your own internal screenshot checks (not the
  user-facing deliverable — see Decisions), `npm install playwright-core`
  into a scratch directory (not the project's own `node_modules`) and point
  it at the system Chrome install at
  `C:\Program Files\Google\Chrome\Application\chrome.exe` via
  `executablePath`.
- **The `handoff` skill (and the other 6 skills installed via `npx skills
  add`) live at `~/.claude/.agents/skills/` and are NOT invokable through
  the `Skill` tool** — read the target skill's `SKILL.md` directly with the
  `Read` tool and follow its instructions manually. This file itself
  deliberately lives at the project root (not the OS temp dir the `handoff`
  skill's own instructions say to use) — that's an established, intentional
  deviation for this project, not an oversight.

## Suggested skills for the next session

- `ui-radar` — try again for the Chat page; retry the 403 in case it was
  transient before falling back to `DESIGN_SPEC.md` alone.
- `ui-slop-score` — self-score each page before calling it done, per
  `INSTRUCTIONS.md`'s Workflow Per Page.
- `anti-ui-slop` — run and fix flagged issues, same workflow step. Its
  `reference/product.md` module (consistent affordances, restrained color,
  all-states components) is what caught the Quick Access sizing bug this
  session — worth reading again before Chat's message bubbles/input bar.
- `supabase` — `chat_messages` table already exists in the schema; re-read
  the security checklist before adding the Gemini Edge Function's
  RLS-touching bits.
- `handoff` — if this next session also runs long, produce another one of
  these (read `~/.claude/.agents/skills/handoff/SKILL.md` directly, per the
  note above).
