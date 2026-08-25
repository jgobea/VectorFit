import Slider from '@react-native-community/slider';
import { Text, View } from 'react-native';

interface RestSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const STEP = 15;

function formatRest(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder === 0 ? `${minutes}m` : `${minutes}m ${remainder}s`;
}

// Rest between sets — a slider in 15s steps per explicit user request,
// switching to a minutes-based label past 60s.
export function RestSlider({ value, min = 15, max = 300, onChange }: RestSliderProps) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">
          Rest between sets
        </Text>
        <Text className="font-body-semibold text-body text-primary-light dark:text-primary">{formatRest(value)}</Text>
      </View>
      <Slider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={STEP}
        onValueChange={onChange}
        minimumTrackTintColor="#00E5FF"
        maximumTrackTintColor="#3A3A3E"
        thumbTintColor="#00E5FF"
      />
    </View>
  );
}
