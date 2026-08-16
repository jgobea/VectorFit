import { Pressable, ScrollView, Text } from 'react-native';

// DESIGN_SPEC.md §C.3 — the exact four pre-populated questions listed there.
const SUGGESTIONS = [
  'How do I improve my form?',
  'Create a chest workout for me',
  'What exercises help with my back?',
  'How many rest days should I take?',
];

interface QuickSuggestionPillsProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

// DESIGN_SPEC.md §C.3: tappable pills that send a pre-populated question.
// react-native-web's ScrollView defaults to flexGrow: 1, so without
// shrink-0/grow-0 here it stretches to fill whatever space its flex-column
// parent has left — which is what blew these up into giant vertical ovals.
export function QuickSuggestionPills({ onSelect, disabled }: QuickSuggestionPillsProps) {
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
