import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text } from 'react-native';

interface DayMenuProps {
  onCopyTo: () => void;
  onClearDay: () => void;
}

// "..." secondary-actions menu for the current day — Copy to other days,
// Clear day. A small bottom sheet, not a native ActionSheet, to match the
// rest of the app's custom-modal styling.
export function DayMenu({ onCopyTo, onClearDay }: DayMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Day options"
        className="h-10 w-10 items-center justify-center rounded-lg active:opacity-70"
      >
        <Feather name="more-horizontal" size={20} color="#A0A0A8" />
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={() => setOpen(false)}>
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="w-full max-w-sm gap-1 rounded-2xl border border-border-light bg-surface-light p-2 dark:border-border dark:bg-surface"
          >
            <Pressable
              onPress={() => {
                setOpen(false);
                onCopyTo();
              }}
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-70"
            >
              <Feather name="copy" size={18} color="#00E5FF" />
              <Text className="font-body-semibold text-body text-primary-light dark:text-primary">Copy to…</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpen(false);
                onClearDay();
              }}
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-xl px-4 py-3.5 active:opacity-70"
            >
              <Feather name="x-circle" size={18} color="#FF3B30" />
              <Text className="font-body-semibold text-body text-error">Clear day</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
