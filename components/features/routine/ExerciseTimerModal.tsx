import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { RoutineExercise } from '@/types/routine';

interface ExerciseTimerModalProps {
  visible: boolean;
  exercise: RoutineExercise | null;
  onClose: () => void;
  onComplete: () => void;
}

type Phase = 'ready' | 'active' | 'rest' | 'done';

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, '0')}`;
}

// A guided timer for exercises measured by duration instead of reps — walks
// through every set (and the rest between them), not just the first one,
// then marks the exercise done the same way finishing it via Live Review or
// the manual check would. Countdown sets auto-advance when they hit zero;
// stopwatch sets (no fixed target) need an explicit "Finish Set" tap. Rest
// is always a countdown, with a Skip option.
export function ExerciseTimerModal({ visible, exercise, onClose, onComplete }: ExerciseTimerModalProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [currentSet, setCurrentSet] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Anything past 'ready' (started the first set) and short of 'done'
  // (finished them all) is progress that closing would silently throw away.
  const hasUnsavedProgress = phase === 'active' || phase === 'rest';

  const requestClose = useCallback(() => {
    if (hasUnsavedProgress) {
      setConfirmExitOpen(true);
    } else {
      onClose();
    }
  }, [hasUnsavedProgress, onClose]);

  const confirmExit = useCallback(() => {
    setConfirmExitOpen(false);
    onClose();
  }, [onClose]);

  const totalSets = exercise?.sets ?? 1;
  const durationSeconds = exercise?.duration_seconds ?? 30;
  const restSeconds = exercise?.rest_seconds ?? 0;
  const isCountdown = (exercise?.exercise?.time_mode ?? 'stopwatch') === 'countdown';

  useEffect(() => {
    if (!visible) return;
    setPhase('ready');
    setCurrentSet(1);
    setElapsed(0);
  }, [visible, exercise?.id]);

  useEffect(() => {
    if (phase !== 'active' && phase !== 'rest') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const finishActiveSet = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (currentSet >= totalSets) {
      setPhase('done');
      onComplete();
      return;
    }
    setElapsed(0);
    if (restSeconds > 0) {
      setPhase('rest');
    } else {
      setCurrentSet((s) => s + 1);
      setPhase('active');
    }
  }, [currentSet, totalSets, restSeconds, onComplete]);

  const finishRest = useCallback(() => {
    Haptics.selectionAsync();
    setCurrentSet((set) => set + 1);
    setElapsed(0);
    setPhase('active');
  }, []);

  // Auto-advance for countdown sets and rest periods.
  useEffect(() => {
    if (phase === 'active' && isCountdown && elapsed >= durationSeconds) finishActiveSet();
    if (phase === 'rest' && elapsed >= restSeconds) finishRest();
  }, [phase, elapsed, isCountdown, durationSeconds, restSeconds, finishActiveSet, finishRest]);

  if (!exercise) return null;

  const display =
    phase === 'rest' ? formatTime(restSeconds - elapsed) : isCountdown ? formatTime(durationSeconds - elapsed) : formatTime(elapsed);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={requestClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/70 px-6" onPress={requestClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm items-center gap-5 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <View className="w-full flex-row items-center justify-between">
            <Text className="flex-1 font-display text-h3 text-primary-light dark:text-primary" numberOfLines={1}>
              {exercise.exercise?.name ?? 'Exercise'}
            </Text>
            <Pressable onPress={requestClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Feather name="x" size={22} color="#A0A0A8" />
            </Pressable>
          </View>

          {phase === 'done' ? (
            <>
              <Feather name="check-circle" size={48} color="#39FF14" />
              <Text className="text-center font-body-semibold text-body text-primary-light dark:text-primary">
                Nice work — all {totalSets} set{totalSets > 1 ? 's' : ''} done.
              </Text>
              <View className="w-full">
                <Button label="Done" onPress={onClose} />
              </View>
            </>
          ) : (
            <>
              <Text className="font-body-semibold text-small text-secondary-light dark:text-secondary">
                {phase === 'rest' ? 'Rest' : `Set ${currentSet} of ${totalSets}`}
              </Text>

              <Text className="font-display text-h1 text-primary-light dark:text-primary">{display}</Text>

              {phase === 'ready' && (
                <View className="w-full">
                  <Button label="Start" onPress={() => setPhase('active')} />
                </View>
              )}

              {phase === 'active' && !isCountdown && (
                <View className="w-full">
                  <Button label="Finish Set" onPress={finishActiveSet} />
                </View>
              )}

              {phase === 'rest' && (
                <View className="w-full">
                  <Button label="Skip Rest" variant="secondary" onPress={finishRest} />
                </View>
              )}
            </>
          )}
        </Pressable>
      </Pressable>

      <ConfirmModal
        visible={confirmExitOpen}
        title="Leave without finishing?"
        message="You're partway through this exercise — closing now won't mark it as done."
        confirmLabel="Leave"
        destructive
        onConfirm={confirmExit}
        onCancel={() => setConfirmExitOpen(false)}
      />
    </Modal>
  );
}
