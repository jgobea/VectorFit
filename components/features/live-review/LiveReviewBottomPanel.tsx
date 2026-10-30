import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Button } from '@/components/ui/Button';
import { translateQuickPoseFeedback } from '@/lib/quickposeFeedback';

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
  /** Set for a timed exercise (plank): `reps`/`targetReps` are seconds held / target seconds. */
  timeMode?: 'countdown' | 'stopwatch';
  isHolding?: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onFinishSet: () => void;
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  return `${m}:${String(total % 60).padStart(2, '0')}`;
}

// Live form meter: fills left to right with QuickPose's 0-100 value for the
// current frame. Deliberately unlabeled, the moving fill reads on its own.
// Animated.View ignores className (NativeWind), so it's styled inline.
function FormBar({ value }: { value: number }) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(Math.max(0, Math.min(100, value)), { duration: 180 });
  }, [value, width]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View className="h-2.5 overflow-hidden rounded-full bg-white/15">
      <Animated.View style={[{ height: '100%', borderRadius: 999, overflow: 'hidden' }, fillStyle]}>
        <LinearGradient colors={['#00E5FF', '#39FF14']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </View>
  );
}

// DESIGN_SPEC.md §D.3, compacted so less of the camera is covered: the cue,
// the form meter, then one row with the count, the set and pause/stop as
// icon buttons. `targetReps` is a threshold that surfaces the "finish set"
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
  timeMode,
  isHolding,
  onTogglePause,
  onStop,
  onFinishSet,
}: LiveReviewBottomPanelProps) {
  const { t, i18n } = useTranslation();
  // QuickPose only sends a feedback string when it has a specific correction
  // to make; no string means "nothing to correct right now", not "I can't
  // see you". Before any frame has been tracked (score and reps still 0)
  // that's genuinely "get in frame".
  const hasStarted = formScore > 0 || reps > 0;
  const idleCue = timeMode
    ? isHolding
      ? t('liveReview.holding')
      : t('liveReview.getIntoPlank')
    : hasStarted
      ? t('liveReview.niceForm')
      : t('liveReview.positionYourself');
  const cue = feedbackText ? translateQuickPoseFeedback(feedbackText, i18n.language) : idleCue;

  const count = timeMode ? formatSeconds(reps) : String(reps);
  const target = timeMode === 'stopwatch' ? null : timeMode ? formatSeconds(targetReps) : String(targetReps);
  const countColor = timeMode && !isHolding ? 'text-secondary' : 'text-green-neon';

  return (
    <View className="gap-3 bg-black/50 px-4 pb-3 pt-3">
      <Text className="min-h-[22px] font-body-semibold text-body text-primary" numberOfLines={2}>
        {cue}
      </Text>

      <FormBar value={formScore} />

      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-baseline">
          <Text className={`font-display text-h2 ${countColor}`}>{count}</Text>
          {target != null && <Text className="font-body-semibold text-body text-secondary"> / {target}</Text>}
          {!timeMode && <Text className="ml-1.5 font-body text-small text-secondary">{t('liveReview.reps').toLowerCase()}</Text>}
        </View>

        <View className="rounded-full bg-white/10 px-3 py-1.5">
          <Text className="font-body-semibold text-small text-primary">
            {t('liveReview.setOf', { current: currentSet, total: totalSets })}
          </Text>
        </View>

        <Pressable
          onPress={onTogglePause}
          accessibilityRole="button"
          accessibilityLabel={isPaused ? t('liveReview.resume') : t('liveReview.pause')}
          hitSlop={4}
          className="h-11 w-11 items-center justify-center rounded-full border border-white/30 active:opacity-70"
        >
          <Feather name={isPaused ? 'play' : 'pause'} size={18} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={onStop}
          accessibilityRole="button"
          accessibilityLabel={t('liveReview.stopSession')}
          hitSlop={4}
          className="h-11 w-11 items-center justify-center rounded-full bg-error active:opacity-80"
        >
          <Feather name="square" size={16} color="#FFFFFF" />
        </Pressable>
      </View>

      {isSetComplete && (
        <Button
          label={isLastSet ? t('liveReview.finishWorkout') : t('liveReview.finishSetN', { n: currentSet })}
          onPress={onFinishSet}
        />
      )}
    </View>
  );
}
