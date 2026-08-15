// Raw token values for places that need a hex string instead of a NativeWind
// className (e.g. LinearGradient colors, StatusBar, splash background).
// Keep in sync with tailwind.config.js `theme.extend.colors`.
export const Colors = {
  dark: {
    background: '#1C1C1E',
    surface: '#2A2A2E',
    border: '#3A3A3E',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A8',
  },
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    border: '#E0E0E3',
    textPrimary: '#1C1C1E',
    textSecondary: '#6B6B76',
  },
  greenNeon: '#39FF14',
  cyanVivid: '#00E5FF',
  warning: '#FFB800',
  error: '#FF3B30',
} as const;

export const GradientPrimary = [Colors.greenNeon, Colors.cyanVivid] as const;
