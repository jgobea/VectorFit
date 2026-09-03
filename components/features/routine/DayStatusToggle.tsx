import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

interface DayStatusToggleProps {
  isRestDay: boolean;
  onChange: (isRestDay: boolean) => void;
}

// Two-segment pill switch — Rest / Training — DESIGN_SPEC.md's brand
// gradient marks the selected side, same visual language as ChipGroup's
// selected state.
export function DayStatusToggle({ isRestDay, onChange }: DayStatusToggleProps) {
  const { t } = useTranslation();
  return (
    <View className="flex-row rounded-xl border border-border-light p-1 dark:border-border">
      <Pressable
        onPress={() => onChange(true)}
        accessibilityRole="button"
        accessibilityState={{ selected: isRestDay }}
        className={`h-10 flex-1 items-center justify-center rounded-lg ${isRestDay ? 'bg-cyan-vivid/15' : ''}`}
      >
        <Text
          className={`font-body-semibold text-small ${isRestDay ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
        >
          {t('routineBuilder.restDay')}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange(false)}
        accessibilityRole="button"
        accessibilityState={{ selected: !isRestDay }}
        className={`h-10 flex-1 items-center justify-center rounded-lg ${!isRestDay ? 'bg-cyan-vivid/15' : ''}`}
      >
        <Text
          className={`font-body-semibold text-small ${!isRestDay ? 'text-cyan-vivid' : 'text-secondary-light dark:text-secondary'}`}
        >
          {t('routineBuilder.trainingDay')}
        </Text>
      </Pressable>
    </View>
  );
}
