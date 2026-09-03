import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text } from 'react-native';

interface QuickSuggestionPillsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

// DESIGN_SPEC.md §C.3: tappable pills that send a pre-populated question.
// react-native-web's ScrollView defaults to flexGrow: 1, so without
// shrink-0/grow-0 here it stretches to fill whatever space its flex-column
// parent has left — which is what blew these up into giant vertical ovals.
// DESIGN_SPEC.md §C.3 — the exact four pre-populated questions listed there.
export function QuickSuggestionPills({ onSelect, disabled }: QuickSuggestionPillsProps) {
  const { t } = useTranslation();
  const SUGGESTIONS = t('chat.suggestions', { returnObjects: true }) as string[];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="max-h-14 grow-0 shrink-0"
      contentContainerClassName="items-center gap-2 px-4 pb-3 pt-1"
      keyboardShouldPersistTaps="handled"
    >
      {SUGGESTIONS.map((text) => (
        <Pressable
          key={text}
          onPress={() => onSelect(text)}
          disabled={disabled}
          accessibilityRole="button"
          className="h-9 items-center justify-center rounded-full border border-cyan-vivid px-3.5 active:opacity-70 disabled:opacity-40"
        >
          <Text className="font-body-medium text-small text-cyan-vivid" numberOfLines={1}>
            {text}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
