import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

interface RoutineBuilderHeaderProps {
  name: string;
  onSaveName: (name: string) => void;
  onBack: () => void;
}

// Sticky top bar per the user's spec: editable routine name + an always-
// visible "Save Routine" action. Field edits below already autosave as you
// go (hooks/useRoutine*.ts) — this button is the explicit "I'm done" action
// the user asked for, plus a final flush of the name field.
export function RoutineBuilderHeader({ name, onSaveName, onBack }: RoutineBuilderHeaderProps) {
  const [draft, setDraft] = useState(name);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  const commitAndBack = () => {
    if (draft.trim().length > 0 && draft !== name) onSaveName(draft.trim());
    onBack();
  };

  return (
    <View className="flex-row items-center gap-3 border-b border-border-light px-4 pb-3 pt-2 dark:border-border">
      <Pressable
        onPress={commitAndBack}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center active:opacity-70"
      >
        <Feather name="chevron-left" size={24} color="#00E5FF" />
      </Pressable>

      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={() => draft.trim().length > 0 && draft !== name && onSaveName(draft.trim())}
        placeholder="Routine name"
        placeholderTextColor="#A0A0A8"
        className="flex-1 font-display text-h3 text-primary-light dark:text-primary"
        accessibilityLabel="Routine name"
      />

      <Pressable
        onPress={commitAndBack}
        accessibilityRole="button"
        className="h-11 items-center justify-center rounded-xl bg-cyan-vivid px-4 active:opacity-80"
      >
        <Text className="font-body-semibold text-small text-[#1C1C1E]">Save Routine</Text>
      </Pressable>
    </View>
  );
}
