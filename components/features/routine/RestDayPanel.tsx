import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface RestDayPanelProps {
  notes: string | null;
  onSaveNotes: (notes: string) => void;
}

// Illustrated rest-day state with an optional quick note ("light walk and
// stretching") — DESIGN_SPEC's "active recovery or full rest" edge case.
export function RestDayPanel({ notes, onSaveNotes }: RestDayPanelProps) {
  const [draft, setDraft] = useState(notes ?? '');

  useEffect(() => {
    setDraft(notes ?? '');
  }, [notes]);

  return (
    <Card className="items-center gap-3 py-8">
      <Feather name="moon" size={24} color="#A0A0A8" />
      <Text className="font-display text-h3 text-primary-light dark:text-primary">Rest Day</Text>
      <Text className="text-center font-body text-small text-secondary-light dark:text-secondary">
        Active recovery or full rest — no exercises needed today.
      </Text>
      <View className="w-full pt-2">
        <Input
          label="Note (optional)"
          placeholder="e.g. Light walk and stretching"
          value={draft}
          onChangeText={setDraft}
          onBlur={() => onSaveNotes(draft)}
        />
      </View>
    </Card>
  );
}
