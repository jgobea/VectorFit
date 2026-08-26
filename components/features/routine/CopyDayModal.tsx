import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { DAY_LABELS_FULL } from '@/types/routine';
import type { RoutineDay } from '@/types/routine';

interface CopyDayModalProps {
  visible: boolean;
  sourceDayId: string;
  days: RoutineDay[];
  isCopying: boolean;
  onClose: () => void;
  onCopy: (targetDayIds: string[]) => void;
}

// Multi-select "Copy to…" — overwrites each selected day's rest status,
// notes, and exercises with the source day's, no merge (kept simple).
export function CopyDayModal({ visible, sourceDayId, days, isCopying, onClose, onCopy }: CopyDayModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const targets = days.filter((d) => d.id !== sourceDayId);

  const toggle = (dayId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">Copy to…</Text>
          <Text className="font-body text-small text-secondary-light dark:text-secondary">
            This replaces the exercises, rest status, and notes on the days you pick.
          </Text>

          <View className="gap-3">
            {targets.map((day) => (
              <ToggleRow
                key={day.id}
                label={DAY_LABELS_FULL[day.day_of_week]}
                value={selected.has(day.id)}
                onChange={() => toggle(day.id)}
              />
            ))}
          </View>

          <View className="flex-row gap-3 pt-2">
            <View className="flex-1">
              <Button label="Cancel" variant="secondary" onPress={handleClose} />
            </View>
            <View className="flex-1">
              <Button
                label="Copy"
                loading={isCopying}
                disabled={selected.size === 0}
                onPress={() => onCopy(Array.from(selected))}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
