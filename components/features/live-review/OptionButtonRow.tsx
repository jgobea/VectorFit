import { Pressable, Text, View } from 'react-native';

interface OptionButtonRowProps {
  label: string;
  options: number[];
  value: number;
  onChange: (value: number) => void;
  formatOption?: (value: number) => string;
}

// Button-group selector, not free text — same pattern DESIGN_SPEC.md's User
// Info page uses for numeric preferences ("30min / 45min / 60min / 90min").
export function OptionButtonRow({ label, options, value, onChange, formatOption }: OptionButtonRowProps) {
  return (
    <View className="gap-2">
      <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`h-11 min-w-[52px] items-center justify-center rounded-xl px-4 active:opacity-70 ${
                selected ? 'bg-cyan-vivid' : 'border border-border-light dark:border-border'
              }`}
            >
              <Text
                className={`font-body-semibold text-body ${
                  selected ? 'text-[#1C1C1E]' : 'text-primary-light dark:text-primary'
                }`}
              >
                {formatOption ? formatOption(option) : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
