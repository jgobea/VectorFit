import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';

interface LiveReviewBottomPanelProps {
  formScore: number;
  feedbackText: string | null;
  reps: number;
  targetReps: number;
  currentSet: number;
  totalSets: number;
  isPaused: boolean;
  isSetComplete: boolean;
  isLastSet: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onFinishSet: () => void;
}

// DESIGN_SPEC.md §D.3: form score, feedback cue, rep/set counters,
// pause/stop. `targetReps` is a threshold that surfaces the "finish set"
// action once reached — it doesn't cap the counter, so reps keep climbing
// past it for anyone training to failure (per user request).
export function LiveReviewBottomPanel({
  formScore,
  feedbackText,
  reps,
  targetReps,
  currentSet,
  totalSets,
  isPaused,
  isSetComplete,
  isLastSet,
  onTogglePause,
  onStop,
  onFinishSet,
}: LiveReviewBottomPanelProps) {
  // QuickPose only sends a feedbackText string when it has a specific
  // correction to make — no string doesn't mean "I can't see you," it means
  // "nothing to correct right now." Before any frame has been tracked yet
  // (formScore/reps both still 0) that's genuinely "get in frame"; once
  // tracking is live, an empty correction is good news, so the fallback
  // copy shouldn't read like a tracking failure at that point.
  const hasStarted = formScore > 0 || reps > 0;

  return (
    <View className="gap-4 bg-black/50 px-4 pb-8 pt-5">
      <View className="flex-row items-end justify-between">
        <View>
          <Text className="font-body text-small text-secondary">Form Score</Text>
          <Text className="font-display text-h1 text-cyan-vivid">{formScore}</Text>
        </View>
        <View className="items-end">
          <Text className="font-body text-small text-secondary">Reps</Text>
          <Text className="font-display text-h1 text-green-neon">
            {reps}
            <Text className="font-body-semibold text-h3 text-secondary"> / {targetReps}</Text>
          </Text>
          <Text className="mt-1 font-body-semibold text-body text-primary">
            Set {currentSet} / {totalSets}
          </Text>
        </View>
      </View>

      <Text className="min-h-[22px] font-body-semibold text-body text-primary" numberOfLines={2}>
        {feedbackText ?? (hasStarted ? 'Nice form — keep it up!' : 'Position yourself in frame to begin')}
      </Text>

      {isSetComplete && (
        <Button label={isLastSet ? 'Finish Workout' : `Finish Set ${currentSet}`} onPress={onFinishSet} />
      )}

      <View className="flex-row gap-3">
        <Pressable
          onPress={onTogglePause}
          accessibilityRole="button"
          className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-border active:opacity-70"
        >
          <Feather name={isPaused ? 'play' : 'pause'} size={18} color="#FFFFFF" />
          <Text className="font-body-semibold text-base text-primary">{isPaused ? 'Resume' : 'Pause'}</Text>
        </Pressable>
        <Pressable
          onPress={onStop}
          accessibilityRole="button"
          className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-error active:opacity-80"
        >
          <Feather name="square" size={18} color="#FFFFFF" />
          <Text className="font-body-semibold text-base text-primary">Stop Session</Text>
        </Pressable>
      </View>
    </View>
  );
}
