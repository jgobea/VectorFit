import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import { EXERCISE_ICON_OPTIONS, type ExerciseIconName } from '@/constants/exerciseIcons';

interface ExerciseIconPickerModalProps {
  visible: boolean;
  selected: ExerciseIconName | null;
  onClose: () => void;
  onSelect: (icon: ExerciseIconName) => void;
}

// Small grid of the limited icon set — tap one to assign it to the
// exercise. No search/scroll needed at 10 options.
export function ExerciseIconPickerModal({ visible, selected, onClose, onSelect }: ExerciseIconPickerModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">Choose an icon</Text>

          <View className="flex-row flex-wrap gap-3">
            {EXERCISE_ICON_OPTIONS.map((icon) => {
              const isSelected = icon === selected;
              return (
                <Pressable
                  key={icon}
                  onPress={() => {
                    onSelect(icon);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={icon}
                  accessibilityState={{ selected: isSelected }}
                  className={`h-14 w-14 items-center justify-center rounded-xl border active:opacity-70 ${
                    isSelected ? 'border-cyan-vivid bg-cyan-vivid/15' : 'border-border-light dark:border-border'
                  }`}
                >
                  <Feather name={icon} size={22} color={isSelected ? '#00E5FF' : '#A0A0A8'} />
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
