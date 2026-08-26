import Slider from '@react-native-community/slider';
import { Text, View } from 'react-native';

interface LabeledSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue: (value: number) => string;
  onChange: (value: number) => void;
}

// Generic slider + live value readout — the pattern Live Review's
// RestSlider introduced, generalized for AI feedback intensity (3-step,
// value formatted to a word) and voice volume (0-100%).
export function LabeledSlider({ label, value, min, max, step, formatValue, onChange }: LabeledSliderProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">{label}</Text>
        <Text className="font-body-semibold text-body text-primary-light dark:text-primary">
          {formatValue(value)}
        </Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={onChange}
        minimumTrackTintColor="#00E5FF"
        maximumTrackTintColor="#3A3A3E"
        thumbTintColor="#00E5FF"
      />
    </View>
  );
}
