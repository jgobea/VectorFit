import { Feather } from '@expo/vector-icons';
import { Modal, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { LiveReviewSummary } from '@/hooks/usePoseSession';

interface SessionSummaryModalProps {
  visible: boolean;
  exerciseName: string;
  totalSets: number;
  summary: LiveReviewSummary | null;
  coachFeedback: string | null;
  isFetchingCoachFeedback: boolean;
  onDone: () => void;
}

// DESIGN_SPEC.md §D.6: post-workout summary — total reps, avg form score,
// best rep, and a motivational close-out. Centered dialog (not a bottom
// sheet) so it reads as a proper close-out screen instead of a small strip
// docked at the bottom — per explicit request, along with folding the
// workout-end coach note in here (see hooks/usePoseSession.ts's
// finishWorkout, which now requests one the same way finishSet does, so
// single-set exercises — no rest period to show it during — still get one).
export function SessionSummaryModal({
  visible,
  exerciseName,
  totalSets,
  summary,
  coachFeedback,
  isFetchingCoachFeedback,
  onDone,
}: SessionSummaryModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 items-center justify-center bg-black/70 px-6">
        <View className="w-full max-w-md rounded-3xl bg-background-light dark:bg-background">
          <ScrollView contentContainerClassName="gap-6 p-8" showsVerticalScrollIndicator={false}>
            <View className="items-center gap-2">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-green-neon/10">
                <Feather name="check" size={30} color="#39FF14" />
              </View>
              <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">
                Nice work!
              </Text>
              <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
                {exerciseName} session complete
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-3">
              <Card className="flex-1 items-center gap-1">
                <Text className="font-display text-h2 text-cyan-vivid">{summary?.totalReps ?? 0}</Text>
                <Text className="font-body text-small text-secondary-light dark:text-secondary">Total Reps</Text>
              </Card>
              <Card className="flex-1 items-center gap-1">
                <Text className="font-display text-h2 text-green-neon">
                  {summary?.setsCompleted ?? 0}/{totalSets}
                </Text>
                <Text className="font-body text-small text-secondary-light dark:text-secondary">Sets</Text>
              </Card>
              <Card className="flex-1 items-center gap-1">
                <Text className="font-display text-h2 text-primary-light dark:text-primary">
                  {summary?.avgFormScore ?? '—'}
                </Text>
                <Text className="font-body text-small text-secondary-light dark:text-secondary">Avg Score</Text>
              </Card>
              <Card className="flex-1 items-center gap-1">
                <Text className="font-display text-h2 text-primary-light dark:text-primary">
                  {summary?.bestRepScore ?? '—'}
                </Text>
                <Text className="font-body text-small text-secondary-light dark:text-secondary">Best Rep</Text>
              </Card>
            </View>

            {(isFetchingCoachFeedback || coachFeedback) && (
              <View className="flex-row items-start gap-2 rounded-xl border border-cyan-vivid/30 bg-cyan-vivid/10 px-4 py-3">
                <Feather name="zap" size={16} color="#00E5FF" style={{ marginTop: 2 }} />
                <Text className="flex-1 font-body text-small text-primary-light dark:text-primary">
                  {isFetchingCoachFeedback ? 'Coach is thinking…' : coachFeedback}
                </Text>
              </View>
            )}

            <Button label="Save Session" onPress={onDone} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
