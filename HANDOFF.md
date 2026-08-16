# VectorFit — Handoff

**Written:** 2026-08-16. **For:** a fresh Claude Code session continuing this
build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and `DESIGN_SPEC.md`
(the design source of truth) at the project root — don't re-derive their contents here.

## Where things stand

Git: `master` branch, latest commit `07e5fae "feat: trainer AI chat —
approved"`, one before it `2ee5d90 "chore: update handoff notes"`, one
before that `77f3fe2 "fix: signup — return to login after account
creation"`, one before that `719d50a "feat: dashboard — approved"`, one
before that `621635a "feat: login page — approved"`. Working tree clean.
Task tracker is not being used to persist state across sessions (checked —
comes back empty each time), so this file is the source of truth for
progress, not `TaskList`.

**Setup phase, Login, Dashboard (done):** see `621635a` and `719d50a` —
unchanged this session, not re-described here.

**Trainer AI Chat page (done, approved, committed in `07e5fae`):**
`app/(app)/chat.tsx` + `hooks/useChat.ts`, and `components/features/`
(`ChatHeader`, `ChatBubble`, `ChatErrorBanner`, `ChatInput`,
`QuickSuggestionPills`, `TypingIndicator`) + `components/ui/Markdown.tsx` +
`lib/markdown.ts`. Header with online status, a message thread of
user/assistant bubbles with avatars and timestamps, quick-suggestion pills,
a growing text input with a gradient send button, and a typing indicator
while a reply streams in. `hooks/useChat.ts` persists history to
`chat_messages` and streams replies word-by-word from the existing
`supabase/functions/chat` Edge Function via `lib/gemini.ts` — that
plumbing was already built during the setup phase, this page is what
actually calls it for the first time.

This page needed a real revision + debugging round after the first build —
see Decisions below, since several of these were live production bugs, not
just visual polish:
- Chat bubble layout bug (avatar on wrong side / whole row collapsing to a
  column) — NativeWind-on-`Animated.View` footgun, see below.
- Quick-suggestion pills rendering as giant vertical ovals — RNW
  `ScrollView` default `flexGrow: 1` footgun, see below.
- Raw `error.message` text swapped for a proper banner + Retry button.
- **The Edge Function itself was fully broken** — CORS preflight, missing
  secret, and a retired model, all three at once. See Decisions.
- Markdown rendering added for assistant replies (Gemini's fitness advice
  naturally comes back as bold/lists/headings) via a small hand-rolled
  parser rather than a third-party package.

**Next up (per `INSTRUCTIONS.md`'s page order):** Trainer AI Live Review
page. Follow the same Workflow Per Page it defines — read `DESIGN_SPEC.md`
§D, `ui-radar` (see caveat below), build, self-score with `ui-slop-score`,
run `anti-ui-slop`, then **stop for explicit approval** before committing.
Don't build ahead of that gate. This page is camera/pose-estimation heavy
(`@quickpose/react-native`) — re-read `INSTRUCTIONS.md`'s QuickPose section
in full before touching it, including fetching the two docs URLs it lists.
It also needs a real device/dev-client, not the web preview — see
Environment quirks.

## Decisions made this session worth knowing about

- **The deployed Edge Function had three independent bugs, all masked as
  one generic error to the user.** Worth reading in full since the next
  page (Live Review) doesn't call Gemini but may hit similar
  platform-config traps if it ever needs its own function:
  1. `supabase/config.toml` had `[functions.chat] verify_jwt = true`.
     Supabase's platform gateway enforces this *before* the request reaches
     our own `Deno.serve` handler — including the CORS preflight `OPTIONS`
     request, which never carries an `Authorization` header by spec. That
     preflight got rejected with a platform-level 401, which the browser
     surfaces as an opaque CORS failure ("has been blocked by CORS
     policy... doesn't have HTTP ok status"), not as a 401 you can read.
     Fixed by setting `verify_jwt = false` and verifying the JWT manually
     inside `supabase/functions/chat/index.ts` (via a scoped
     `createClient(...).auth.getUser()` call) *after* the `OPTIONS` branch
     — the standard documented Supabase pattern for CORS + auth together.
  2. `GEMINI_API_KEY` had never actually been pushed as a secret to the
     live project — `supabase secrets list` only showed the auto-injected
     `SUPABASE_*` ones. Pushed it from `.env` via `supabase secrets set`.
  3. The model name `gemini-2.0-flash` (from `INSTRUCTIONS.md`'s original
     spec) is retired — Google returns a 404 for it now. Switched to the
     `gemini-flash-latest` alias (currently resolves to `gemini-3.7-flash`)
     specifically so this doesn't go stale the same way again. If Gemini
     calls break again later, check `GET
     https://generativelanguage.googleapis.com/v1beta/models?key=...` for
     the current model list before assuming it's a code bug.
  - Deploying requires `SUPABASE_ACCESS_TOKEN` — none is stored anywhere in
    the repo, CLI isn't pre-authenticated. The user provided a personal
    access token ad hoc, used inline for the deploy commands and not
    persisted anywhere. You'll need to ask again next time a function needs
    (re)deploying.
- **NativeWind + Reanimated footgun:** `Animated.View` (from
  `react-native-reanimated`) is **not** registered with NativeWind's
  `cssInterop`, so a `className` prop on it is silently a no-op — no error,
  the classes just don't apply. This exactly caused the chat-bubble layout
  bug (a `flex-row`/`justify-end` row silently rendered as a column
  instead). Fix: put layout classes on a plain `View` nested *inside* the
  `Animated.View`; only use `entering`/`exiting`/`style` (not `className`)
  on the `Animated.View` itself. Apply this same pattern anywhere Reanimated
  entrance/exit animations are added to a NativeWind-styled tree.
- **react-native-web `ScrollView` defaults to `flexGrow: 1`.** Placed
  inside a flex-column without `grow-0 shrink-0` (or an explicit
  height/`max-h-*`), it silently expands to fill all remaining space in its
  parent — this is what turned `QuickSuggestionPills` into giant vertical
  ovals (each pill stretched to fill the ScrollView's inflated height).
  Any horizontal `ScrollView` living inside a flex column on web needs an
  explicit `grow-0 shrink-0` (+ ideally a `max-h-*` cap) or it will do this.
- **No third-party Markdown library** — `lib/markdown.ts` +
  `components/ui/Markdown.tsx` are a small hand-rolled parser (headings,
  bold/italic, bullet/numbered lists — not full CommonMark) instead of e.g.
  `react-native-markdown-display`, specifically to avoid another
  RN 0.86 / React 19 compatibility surprise for a fairly narrow feature
  need. Only wired into assistant bubbles, not user bubbles.
- **Expo Go cannot be used to preview this project.** The installed SDK
  (57) is newer than what the Expo Go app currently supports — confirmed
  with the user, no SDK 55/56-era Expo Go build is available either.
  Downgrading the whole project to SDK 54 was considered and explicitly
  declined by the user (real risk: touches every `expo-*`/RN/Reanimated/
  FlashList version across the whole app, including already-approved
  pages) — **do not revisit this unless the user explicitly asks again.**
  Web preview (`expo start --web`) is the agreed path for every page,
  including this one.

## Environment quirks (so you don't re-debug them)

- **Direct Postgres access is unreachable from this sandbox** (IPv6-only
  hostname, no route out) — use the Management API pattern from the setup
  session if you need more schema changes: `POST
  https://api.supabase.com/v1/projects/{ref}/database/query` with
  `Authorization: Bearer $SUPABASE_ACCESS_TOKEN` (ask the user for a fresh
  token — none is stored in the repo), then backfill
  `supabase_migrations.schema_migrations` by hand. The project ref is
  `wyfxwvdzqnylevwypony` (also in `supabase/.temp/project-ref`).
- **`.env` has real, working project credentials** already filled in —
  don't ask again. Correctly gitignored. `SUPABASE_ACCESS_TOKEN` is *not*
  in there (see Decisions above) — that's a separate personal credential
  you'll need to ask for if a function needs deploying.
- **Expo dev server cold bundles are slow here** — up to ~5 min for a clean
  `expo start --web`. A short `curl` timeout is not proof it's broken;
  check the log file and `Get-Process node`/`tasklist` CPU before
  concluding something crashed. Once it's up, Fast Refresh on subsequent
  edits is fast (seconds). If a prior session's dev server is still running
  on port 8081 but the log looks stale/stuck on an old error, it's usually
  safe to `taskkill //PID <pid> //F` it and start fresh rather than trying
  to reattach — the Metro cache on disk survives the restart, so the next
  cold-looking bundle is actually fast.
- **No `chromium-cli`.** For your own internal screenshot checks (not the
  user-facing deliverable — the user reviews pages themselves via the dev
  server, see below), `npm install playwright-core` into a scratch
  directory (not the project's own `node_modules`) and point it at the
  system Chrome install at
  `C:\Program Files\Google\Chrome\Application\chrome.exe` via
  `executablePath`.
- **The `handoff` skill (and the other 6 skills installed via `npx skills
  add`) live at `~/.claude/.agents/skills/` and are NOT invokable through
  the `Skill` tool** — read the target skill's `SKILL.md` directly with the
  `Read` tool and follow its instructions manually. This file itself
  deliberately lives at the project root (not the OS temp dir the `handoff`
  skill's own instructions say to use) — that's an established, intentional
  deviation for this project, not an oversight.
- **User verifies pages by looking at the running dev server themselves**,
  not via a headless-Chrome-screenshot → HTML/artifact report. Start
  `expo start --web` and hand them the URL; don't build a report as the
  deliverable.
- **UIZZE's `ui-radar` is blocked in this environment**: both
  `https://uizze.com/api/search` and `/search` return HTTP 403 to
  `WebFetch`. Tried again this session (third time), still 403 — treat as a
  hard environment-level block at this point, not worth retrying again;
  proceed straight from `DESIGN_SPEC.md` per the skill's own "don't stop
  useful work when a tool is unavailable" guidance.

## Suggested skills for the next session

- `ui-radar` — probably still blocked (see above), but the skill's own
  guidance says don't let that stop useful work either way.
- `ui-slop-score` — self-score the Live Review page before calling it done,
  per `INSTRUCTIONS.md`'s Workflow Per Page.
- `anti-ui-slop` — run and fix flagged issues, same workflow step.
- `supabase` — `pose_sessions` table already exists in the schema; re-read
  the security checklist if Live Review needs any new RLS-touching writes.
- `handoff` — if this next session also runs long, produce another one of
  these (read `~/.claude/.agents/skills/handoff/SKILL.md` directly, per the
  note above).
