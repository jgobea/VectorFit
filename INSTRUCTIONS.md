Before writing any code, you MUST read the following files in this exact order:

1. /DESIGN_SPEC.md — This is the single source of truth for the entire app.
   Read it completely before doing anything else. All colors, fonts, spacing,
   and component behavior are defined there. Do not redefine or override them.
2. C:\Users\david\.claude\.agents\skills
3. Then read all of these skills in any order:
   - ui-slop-score
   - anti-ui-slop
   - handoff
   - supabase
   - ui-design
   - ui-radar

---

## Project: VectorFit — AI-Powered Workout Mobile App

You are building a mobile-first fitness app called **VectorFit**.
DESIGN_SPEC.md is your only design reference. Do not deviate from it.
The app supports both dark and light themes — implement both using
NativeWind's dark: variants.

---

## Project Structure

Scaffold the project with this exact folder structure before writing
any page:

vectorfit/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (app)/
│   │   ├── dashboard.tsx
│   │   ├── chat.tsx
│   │   ├── live-review.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
│   ├── ui/                 # Primitives: Button, Input, Card, etc.
│   └── features/           # Feature components: WorkoutCard, ChatBubble, etc.
├── stores/                 # Zustand stores
├── lib/
│   ├── supabase.ts
│   ├── gemini.ts
│   └── quickpose.ts
├── hooks/                  # Custom hooks: useWorkout, useChat, usePoseSession
├── types/                  # TypeScript interfaces and types
├── constants/              # Theme tokens, QuickPose feature strings
├── supabase/
│   ├── migrations/         # SQL migration files
│   └── functions/          # Edge Functions (Gemini calls go here)
├── DESIGN_SPEC.md
└── .env

---

## Stack & Architecture

- **Framework:** Expo (managed workflow) with TypeScript, using Expo Router
  with (auth) and (app) route groups for automatic session-based redirects
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
  - Map all VectorFit design tokens from DESIGN_SPEC.md into
    tailwind.config.js as custom colors/spacing so they are usable
    as utility classes everywhere (e.g. bg-surface, text-primary,
    from-green-neon to-cyan-vivid)
  - Use dark: variants for all theme switching
- **State Management:** Zustand
  - One store per domain: authStore, workoutStore, userStore, uiStore
  - uiStore manages theme preference (dark/light) persisted via AsyncStorage
  - Stores handle UI state and local cache only — Supabase is always
    the source of truth
  - Implement optimistic updates in Zustand so the UI responds immediately
    before Supabase confirms
- **Auth & Database:** Supabase
  - Follow the supabase skill for client setup, auth hooks, and RLS
  - All Supabase calls go through lib/supabase.ts — never inline in components
  - Enable Row Level Security on every table from day one
  - Generate TypeScript types with: npx supabase gen types typescript
    Never write Supabase types by hand
  - Set up the database schema and migrations BEFORE building any page
    Schema must include: users, workouts, exercises, workout_sessions,
    chat_messages, pose_sessions
- **AI Chat:** Google Gemini via @google/generative-ai SDK
  - Model: gemini-2.0-flash
  - All Gemini API calls must go through a Supabase Edge Function
    (supabase/functions/chat/index.ts) — never call the Gemini API
    directly from the client, the API key must never be exposed
  - Implement streaming responses so text appears word by word in the
    chat UI — do not wait for the full response before rendering
  - Centralize all Gemini logic in lib/gemini.ts
- **Pose Estimation:** @quickpose/react-native

  BEFORE implementing anything related to pose estimation, fetch and read
  both of these pages in full:

  1. https://docs.quickpose.ai/docs/MobileSDK/GettingStarted/Integration-ReactNative
     — installation, camera permissions, QuickPoseView usage,
     onUpdate callback, featureStyles API, captureFrame/shareFrame refs

  2. https://docs.quickpose.ai/docs/MobileSDK/Features/Exercises
     — full list of supported fitness.* feature strings, rep counting
     behavior, and exercise-specific notes

  Key implementation rules:
  - Install: npm install @quickpose/react-native
  - iOS only: cd ios && pod install
  - Add to Info.plist:
      <key>NSCameraUsageDescription</key>
      <string>Camera access is needed for pose estimation</string>
  - Android: no extra steps, minimum SDK 26
  - Store the SDK key in .env as QUICKPOSE_SDK_KEY, never hardcode it
  - Use <QuickPoseView sdkKey={} features={[]} useFrontCamera onUpdate />
  - Select features dynamically based on the exercise chosen by the user,
    using the fitness.* strings from the Exercises doc — never guess them
  - Always include overlay.wholeBody alongside the fitness.* feature
  - onUpdate provides event.nativeEvent: { results, feedback }
      - feedback → real-time form cue text shown to the user
      - results[0].value → form score displayed on screen
  - Style the skeleton to match brand colors via featureStyles:
      color: '#00E5FF', shadow: { color: '#39FF14', radius: 24 }
  - Camera requires a physical device — show a clear fallback UI on
    simulators
  - Lazy load the Live Review page — it is heavy and not needed on startup

---

## Environment Variables

Structure .env exactly like this — no exceptions:

  # Client-side (Expo public)
  EXPO_PUBLIC_SUPABASE_URL=
  EXPO_PUBLIC_SUPABASE_ANON_KEY=

  # Server-side only (Edge Functions)
  GEMINI_API_KEY=
  QUICKPOSE_SDK_KEY=
  SUPABASE_SERVICE_ROLE_KEY=

Never reference GEMINI_API_KEY or SUPABASE_SERVICE_ROLE_KEY anywhere
in the client-side code.

---

## Pages to Build

Set up the following BEFORE building any page:
  1. Project structure and folder scaffold
  2. tailwind.config.js with all design tokens from DESIGN_SPEC.md
  3. Supabase schema and migrations
  4. lib/supabase.ts, lib/gemini.ts, lib/quickpose.ts
  5. All Zustand stores (empty/skeleton)
  6. Supabase Edge Function for Gemini chat
  7. Base _layout.tsx with auth redirect logic and theme provider

Then build pages in this order, one at a time:
  1. Login
  2. Dashboard
  3. Trainer AI Chat
  4. Trainer AI Live Review
  5. User Info

Do not move to the next page until the current one is approved and committed.

---

## Workflow Per Page

For each page, follow this exact sequence:

1. Read the relevant section in DESIGN_SPEC.md
2. Run ui-radar to identify components needed
3. Build the component/screen
4. Self-score with ui-slop-score — must pass before moving on
5. Run anti-ui-slop checks and fix any flagged issues
6. Prepare handoff notes for the next page
7. STOP and wait for explicit approval before continuing

Once the user approves the page, run:
  git add .
  git commit -m "feat: [page name] — approved"

Do not commit unapproved work. Do not move to the next page without
a commit confirming the previous one.

---

## Code Quality Standards

- TypeScript strict mode — no 'any' types anywhere
- Use Expo Router with (auth) and (app) route groups
- All Supabase calls go through lib/supabase.ts, never inline
- All Gemini calls go through a Supabase Edge Function, never from client
- Use FlashList (Shopify) instead of FlatList for all scrollable lists
- Implement streaming for all Gemini chat responses
- Custom hooks for all business logic — components handle UI only
- Use React.memo and useCallback on chat components
- Max ~150 lines per file — split into smaller files if larger
- Conventional Commits: feat:, fix:, chore:, refactor:
- Generate Supabase types: npx supabase gen types typescript
- All env vars follow EXPO_PUBLIC_ prefix for client-side only
- Validate inputs on both client and Edge Function side

---

## What NOT to do

- Do not hardcode colors or fonts — everything comes from DESIGN_SPEC.md
  tokens mapped through tailwind.config.js
- Do not use default Expo/RN component styles without overriding to match
  the design system
- Do not build any page before the setup steps are complete and confirmed
- Do not build all pages at once — one page, one approval, one commit
- Do not invent anything not already in DESIGN_SPEC.md
- Do not skip reading a skill before using it
- Do not call Gemini or expose any private key from client-side code
- Do not hardcode the QuickPose SDK key — always read from .env
- Do not guess QuickPose feature strings — derive them from the docs above
- Do not use FlatList — always use FlashList
- Do not write Supabase types by hand — always generate them