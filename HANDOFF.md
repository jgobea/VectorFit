# VectorFit — Handoff

**Written:** 2026-08-18. **For:** a fresh Claude Code session continuing this
build.
**Read first:** `INSTRUCTIONS.md` (build workflow, stack, rules) and
`DESIGN_SPEC.md` (the design source of truth) at the project root — still on
disk, just gitignored now (see below), don't re-derive their contents here.

## Where things stand

Git: on branch **`chore/expo-sdk-54`** (off `master`), pushed to the `github`
remote. Working tree clean. Commits on this branch, oldest first:
`56c9346` (deps downgrade), `f00857c` (web import.meta fix), `6485240`
(splash screen fix), `b8f747b` (untrack internal dev docs), plus whatever
commit added this file. **Not merged to `master` yet** — deliberately kept
on its own branch since a full SDK downgrade touches every
`expo-*`/RN/Reanimated/FlashList version across already-approved pages; see
Next up.

Remotes — two, don't confuse them:
- `origin` → `C:/Users/david/supa/tesis/./VectorFit`, a **local filesystem
  path**. This `CopiaVectorFit` checkout is a local clone of that other
  folder, not of GitHub.
- `github` → `https://github.com/jgobea/VectorFit.git`, the real GitHub
  repo (added this session). Push over HTTPS needed one interactive
  browser login via Windows' Git Credential Manager; should be cached on
  this machine now. Non-interactive `git push` calls get denied outright by
  the auto-mode classifier regardless of prior conversation authorization —
  ask the user to run it themselves (`! git push ...`) or get fresh
  confirmation before retrying.

Task tracker is not being used to persist state across sessions — this file
is the source of truth for progress, not `TaskList`.

**Setup phase, Login, Dashboard, Trainer AI Chat (done, approved):**
unchanged this session, see prior commits — not re-described here.

## What changed this session: Expo 57 → 54 downgrade

The user asked again (previous handoff had this explicitly declined — see
correction below). Full summary, don't re-derive from the diff:

- **Dependency downgrade.** `expo` `~57.0.12` → `~54.0.0`, and the whole
  `expo-*`/RN/Reanimated/router/etc. tree with it. Versions were **not**
  hand-picked from memory — cross-checked via npm dist-tags, then finalized
  with `npx expo install --fix` (the authoritative source), which only had
  to correct `react-native` by one patch version. `npx expo-doctor` passes
  18/18 after.
- **Dropped two unused packages:** `@expo/ui` (no SDK 54 release exists at
  all — its npm versions jump straight from `0.x`/`1.x` to `55.x`) and
  `expo-glass-effect` (has an SDK 54 release, but was also unused). Neither
  was imported anywhere in app code — confirmed via grep before removing,
  user approved removing both.
- **Added `babel-preset-expo` as an explicit devDependency.** It was only
  ever present nested under `node_modules/expo/node_modules/babel-preset-expo`
  and npm wasn't hoisting it, so `babel.config.js`'s direct
  `require('babel-preset-expo')` failed with "Cannot find module". If you
  ever see that error again after a dependency change, check hoisting
  first.
- **Fixed a web-only bundling crash:** `stores/uiStore.ts` imports `persist`
  from `zustand/middleware`, which resolves to zustand's ESM build on web
  and contains a bare `import.meta.env` reference. Metro serves the web
  bundle as one classic (non-module) `<script>`, so browsers threw
  `SyntaxError: Cannot use 'import.meta' outside a module` before any app
  code ran — blank page. Fixed in `babel.config.js` by passing
  `web: { unstable_transformImportMeta: true }` to `babel-preset-expo`,
  which rewrites any `import.meta` (including inside `node_modules`) to
  `globalThis.__ExpoImportMetaRegistry`. Requires `expo start --clear` to
  pick up (Metro caches babel transforms per-file).
- **Fixed a real app bug, found via Expo Go testing:**
  `app/_layout.tsx`'s splash-hide call lived inside
  `GestureHandlerRootView`'s `onLayout` prop, which only fires once per
  mount. If `ready` flipped to `true` without a fresh layout pass following
  it, `SplashScreen.hideAsync()` never ran — the native splash stayed
  visually on top forever even though the login screen underneath had
  already rendered and was receiving touches (reported by the user as
  "los campos están ahí pero invisibles debajo de la pantalla de carga").
  Fixed by moving the call into a `useEffect` keyed on `ready`, independent
  of any layout event.
- **Untracked `AGENTS.md`, `INSTRUCTIONS.md`, `DESIGN_SPEC.md` from git**
  (added to `.gitignore`), at the user's request — they're internal
  dev-process docs, not project-facing. They still exist locally and you
  should still read them; they just won't show up in `git status`/diffs
  going forward and won't be part of future commits. **`HANDOFF.md` stays
  tracked deliberately** — it's the cross-session handoff mechanism.
- **Expo Go now works for this project.** Verified end-to-end: bundle
  downloads, app loads, login screen renders and is interactive on a real
  Android device via Expo Go SDK 54, connected over LAN
  (`exp://<LAN-IP>:8081`). Web preview (`expo start --web`) still works
  too — same Metro instance serves both.

### Correction to the previous handoff

That version said: *"Expo Go cannot be used to preview this project... do
not revisit \[the SDK 54 downgrade] unless the user explicitly asks
again."* The user did ask again this session. Ignore that old guidance —
Expo Go is now the primary way the user wants to verify native-only
features going forward (per `INSTRUCTIONS.md`'s QuickPose section, Live
Review needs a real device anyway).

## Next up

Per `INSTRUCTIONS.md`'s page order: **Trainer AI Live Review** page
(camera/pose-estimation, `@quickpose/react-native`). Before that, or
alongside it:

1. **Decide on merging `chore/expo-sdk-54` into `master`.** This session
   only smoke-tested the login screen; Dashboard and Trainer AI Chat
   (already approved under SDK 57) haven't been re-verified under SDK 54.
   Walk them on web and/or Expo Go before merging, or merge first and fix
   forward — ask the user which they'd rather do.
2. **`@quickpose/react-native` hasn't actually been exercised yet.** Its
   peer deps are loose (`react >=18.2.0`, `react-native >=0.75.0`, no
   conflict), but its native pose-detection code has never run under RN
   0.81/SDK 54 — that's the real test, not the npm resolution. Re-read
   `INSTRUCTIONS.md`'s QuickPose section (including its two linked docs)
   before touching Live Review, same as before.
3. Follow `INSTRUCTIONS.md`'s Workflow Per Page as usual — `DESIGN_SPEC.md`
   §D, `ui-radar` (see caveat below), build, `ui-slop-score`,
   `anti-ui-slop`, **stop for explicit approval** before committing.

## Decisions carried forward from earlier sessions (still true)

- **NativeWind + Reanimated footgun:** `Animated.View` isn't registered
  with NativeWind's `cssInterop`, so `className` on it is silently a
  no-op. Layout classes go on a plain `View` nested inside it; only
  `entering`/`exiting`/`style` go on the `Animated.View` itself.
- **react-native-web `ScrollView` defaults to `flexGrow: 1`.** Any
  horizontal `ScrollView` inside a flex column on web needs explicit
  `grow-0 shrink-0` (+ ideally `max-h-*`) or it silently expands.
- **No third-party Markdown library** — `lib/markdown.ts` +
  `components/ui/Markdown.tsx` are hand-rolled, deliberately, to avoid
  another RN 0.86 / React 19 (now RN 0.81/React 19.1) compatibility
  surprise. Only wired into assistant chat bubbles.
- Supabase Edge Function (`chat`) deploy gotchas (JWT verification vs. CORS
  preflight, secrets not auto-present, retired Gemini model names) — see
  the git history around commit `07e5fae` if you need to touch that
  function again; not re-described here.

## Environment quirks (so you don't re-debug them)

- **Windows doesn't reliably kill the whole `expo start` process tree.**
  Stopping a background task (or Ctrl+C) can leave an orphaned `node.exe`
  holding port 8081. If you see "Port 8081 is being used by another
  process" right after stopping a server, find and kill it:
  `Get-NetTCPConnection -LocalPort 8081 -State Listen` →
  `Stop-Process -Id <pid> -Force`.
- **Metro caches babel transforms on disk.** After editing
  `babel.config.js`, restart with `expo start --clear` or you'll keep
  seeing the old (possibly broken) transform output.
- **Pushing to the `github` remote needs an interactive login the first
  time** on a new machine/session (Git Credential Manager, browser-based).
  The auto-mode classifier blocks non-interactive `git push` outright even
  with prior explicit user authorization in the conversation — hand it to
  the user as `! git push ...` rather than retrying it yourself
  silently.
- **Direct Postgres access is unreachable from this sandbox** (IPv6-only
  hostname). Use the Management API pattern instead: `POST
  https://api.supabase.com/v1/projects/{ref}/database/query` with
  `Authorization: Bearer $SUPABASE_ACCESS_TOKEN` (ask the user for a fresh
  token — none is stored in the repo), then backfill
  `supabase_migrations.schema_migrations` by hand. Project ref:
  `wyfxwvdzqnylevwypony`.
- **`.env` has real, working project credentials** already filled in —
  don't ask again. Correctly gitignored. `SUPABASE_ACCESS_TOKEN` is *not*
  in there — separate personal credential, ask for it again if a function
  needs (re)deploying.
- **No `chromium-cli`.** For your own internal checks (not the user-facing
  deliverable), `npm install playwright-core` into a scratch directory and
  point it at `C:\Program Files\Google\Chrome\Application\chrome.exe` via
  `executablePath`.
- **The `handoff` skill lives at `~/.claude/.agents/skills/` and is NOT
  invokable through the `Skill` tool** — read `SKILL.md` there directly and
  follow it manually. This file deliberately lives at the project root
  (not the OS temp dir the skill's own instructions say to use) and stays
  git-tracked (unlike the other internal docs, see above) — both
  intentional deviations for this project, not oversights.
- **User verifies pages themselves** — via the running dev server
  (`expo start --web` URL, or now also Expo Go on a real device) — not via
  a headless-screenshot report. Hand them the URL/QR; don't build a report
  as the deliverable.
- **UIZZE's `ui-radar` is blocked in this environment**: both
  `https://uizze.com/api/search` and `/search` return HTTP 403 to
  `WebFetch`. Confirmed repeatedly across sessions — treat as a hard
  environment-level block, not worth retrying; proceed straight from
  `DESIGN_SPEC.md` per the skill's own "don't stop useful work" guidance.

## Suggested skills for the next session

- `ui-radar` — probably still blocked (see above), don't let that block
  progress either way.
- `ui-slop-score` / `anti-ui-slop` — self-score and fix Live Review before
  calling it done, per `INSTRUCTIONS.md`'s Workflow Per Page.
- `supabase` — `pose_sessions` table already exists in the schema; re-check
  the security checklist if Live Review needs any new RLS-touching writes.
- `handoff` — if this next session also runs long, produce another one
  (read `~/.claude/.agents/skills/handoff/SKILL.md` directly, per the note
  above).
