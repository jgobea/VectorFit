# VectorFit Local (offline build)

Same app as [VectorFit](https://github.com/jgobea/VectorFit) but with **no Supabase, Gemini or Google sign-in**:
everything runs on the device, so it can be demoed with no internet.

## What changed vs. the online version

| Online                          | Offline                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@supabase/supabase-js` client  | `lib/supabase.ts` -> on-device DB in `lib/local/` (AsyncStorage)         |
| Supabase Auth                   | `lib/local/auth.ts`: accounts stored on the device                       |
| Storage bucket (avatars)        | Image copied to the app's document directory                             |
| Gemini chat Edge Function       | `lib/gemini.ts` + `lib/offlineCoach.ts`: keyword-based canned replies    |
| Live Review feedback Function   | `lib/liveReviewCoach.ts`: generated locally                              |
| Continue with Google            | Removed                                                                  |

Hooks and screens are untouched: they still call `supabase.from(...)`, which the local engine answers.
QuickPose (camera pose tracking) already runs on-device.

## Run it

```bash
npm install
npx expo run:android      # first run generates ./android and installs the dev build
```

Needs `EXPO_PUBLIC_QUICKPOSE_SDK_KEY` in `.env` (see `.env.example`). Expo Go cannot run Live Review.

The package id is `com.vectorfit.local`, so it installs next to the online app without replacing it.

## Demo account

`demo@vectorfit.app` / `demo123` (onboarding already completed). You can also register a new account;
all data stays on the phone. Data persists across restarts; clearing app storage resets it.
