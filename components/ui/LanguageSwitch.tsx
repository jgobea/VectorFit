import { Pressable, Text, View } from 'react-native';

import { useLocaleStore, type AppLocale } from '@/stores/localeStore';

const OPTIONS: { value: AppLocale; flag: string; label: string; a11yLabel: string }[] = [
  { value: 'es', flag: '🇪🇸', label: 'ES', a11yLabel: 'Español' },
  { value: 'en', flag: '🇺🇸', label: 'EN', a11yLabel: 'English' },
];

// Self-contained (reads/writes useLocaleStore directly, no props) since it's
// a single global app setting dropped into more than one screen — Login and
// Profile's Account section — rather than a field bound to some form draft.
export function LanguageSwitch() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <View className="flex-row self-start rounded-xl border border-border-light p-1 dark:border-border">
      {OPTIONS.map((option) => {
        const selected = option.value === locale;
        return (
          <Pressable
            key={option.value}
            onPress={() => setLocale(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.a11yLabel}
            className={`flex-row items-center gap-1.5 rounded-lg px-3 py-1.5 active:opacity-70 ${
              selected ? 'bg-cyan-vivid/15' : ''
            }`}
          >
            <Text className="text-body">{option.flag}</Text>
            <Text
              className={`font-body-semibold text-small ${
                selected ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
