import { Modal, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { LiveReviewSummary } from '@/hooks/usePoseSession';

interface SessionSummaryModalProps {
  visible: boolean;
  exerciseName: string;
  totalSets: number;
  summary: LiveReviewSummary | null;
  onDone: () => void;
}

// DESIGN_SPEC.md §D.6: post-workout summary — total reps, avg form score,
// best rep, and a motivational close-out. Sets Completed added since Live
// Review is now a multi-set flow.
export function SessionSummaryModal({ visible, exerciseName, totalSets, summary, onDone }: SessionSummaryModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/60">
        <SafeAreaView edges={['bottom']} className="rounded-t-3xl bg-background-light dark:bg-background">
          <View className="gap-5 p-6">
            <Text className="text-center font-display text-h2 text-primary-light dark:text-primary">
              Nice work!
            </Text>
            <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
              {exerciseName} session complete
            </Text>

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

            <Button label="Save Session" onPress={onDone} />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
