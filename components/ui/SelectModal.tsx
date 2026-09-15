import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectModalProps<T extends string> {
  visible: boolean;
  title: string;
  options: SelectOption<T>[];
  selected: T | null;
  onClose: () => void;
  onSelect: (value: T) => void;
}

// A NativeWind max-h-[70%] on a View nested inside two Pressables didn't
// reliably resolve on Android (see Live Review's ExercisePickerModal) — RN's
// percentage-height resolution against non-trivial ancestor chains is flaky.
// Computing the cap in pixels from the window is unambiguous.
const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.7;

// Generic bottom-sheet dropdown — the same pattern Live Review's exercise
// picker uses, generalized for any flat single-select list (primary goal,
// language, training time preset). Ungrouped, unlike ExercisePickerModal's
// by-category sections, since none of this page's lists need grouping.
export function SelectModal<T extends string>({
  visible,
  title,
  options,
  selected,
  onClose,
  onSelect,
}: SelectModalProps<T>) {
  const { t } = useTranslation();
  return (
    // animationType="fade" (not "slide") so the backdrop darkens the whole
    // screen at once — RN's "slide" animates backdrop+sheet as a single
    // block sliding up from off-screen, which visibly drags the darkness up
    // from the bottom instead of dimming everything immediately. The sheet
    // still rises on its own via the Reanimated entering animation below.
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Animated.View entering={SlideInDown.duration(250)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <SafeAreaView
              edges={['bottom']}
              style={{ maxHeight: SHEET_MAX_HEIGHT }}
              className="rounded-t-3xl bg-background-light dark:bg-background"
            >
              <View className="flex-row items-center justify-between px-5 pt-4">
                <Text className="font-display text-h3 text-primary-light dark:text-primary">{title}</Text>
                <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('common.close')} hitSlop={8}>
                  <Feather name="x" size={22} color="#00E5FF" />
                </Pressable>
              </View>

              <ScrollView className="px-5" contentContainerClassName="gap-2 pb-6 pt-3">
                {options.map((option) => {
                  const isSelected = option.value === selected;
                  return (
                    <Card
                      key={option.value}
                      onPress={() => onSelect(option.value)}
                      className={`flex-row items-center justify-between ${isSelected ? 'border-cyan-vivid' : ''}`}
                    >
                      <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
                        {option.label}
                      </Text>
                      {isSelected && <Feather name="check" size={18} color="#00E5FF" />}
                    </Card>
                  );
                })}
              </ScrollView>
            </SafeAreaView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
