import { Pressable, Text, View } from 'react-native';

interface ChipOption<T extends string | number> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string | number> {
  label: string;
  value: T | null;
  options: ChipOption<T>[];
  onChange: (value: T) => void;
}

// DESIGN_SPEC.md §E.3/E.4: single-select button rows for workout frequency
// (3/4/5/6/7) and preferred duration (30/45/60/90) — a short, fixed set of
// numeric choices reads faster as tappable chips than a dropdown or slider.
export function ChipGroup<T extends string | number>({ label, value, options, onChange }: ChipGroupProps<T>) {
  return (
    <View className="gap-2">
      <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`h-11 min-w-[52px] items-center justify-center rounded-xl border px-4 active:opacity-70 ${
                selected ? 'border-cyan-vivid bg-cyan-vivid/15' : 'border-border-light dark:border-border'
              }`}
            >
              <Text
                className={`font-body-semibold text-body ${
                  selected ? 'text-cyan-vivid' : 'text-primary-light dark:text-primary'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
