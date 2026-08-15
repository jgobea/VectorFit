// Config wrapper for @quickpose/react-native. Deliberately does not hardcode
// any `fitness.*` feature strings — INSTRUCTIONS.md requires deriving those
// per-exercise from docs.quickpose.ai/docs/MobileSDK/Features/Exercises when
// the Live Review page is built, never guessing them.

// NOTE: QuickPoseView needs this value client-side to initialize the camera
// view, so it must be EXPO_PUBLIC_-prefixed to be readable in the app bundle
// — INSTRUCTIONS.md lists QUICKPOSE_SDK_KEY under server-only vars, which
// would make it unreachable from the client and break the component. Using
// EXPO_PUBLIC_QUICKPOSE_SDK_KEY here instead; flagged for the user.
export const QUICKPOSE_SDK_KEY = process.env.EXPO_PUBLIC_QUICKPOSE_SDK_KEY;

if (!QUICKPOSE_SDK_KEY && __DEV__) {
  console.warn('EXPO_PUBLIC_QUICKPOSE_SDK_KEY is not set — Live Review will not function.');
}

// Brand-matched skeleton overlay style, per DESIGN_SPEC.md / INSTRUCTIONS.md.
export const QUICKPOSE_OVERLAY_STYLE = {
  color: '#00E5FF',
  shadow: { color: '#39FF14', radius: 24 },
} as const;

// Always included alongside the exercise-specific fitness.* feature.
export const QUICKPOSE_BASE_FEATURES = ['overlay.wholeBody'] as const;
