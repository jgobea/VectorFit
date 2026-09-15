import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { LiveReviewSummary } from '@/hooks/usePoseSession';

interface SessionSummaryModalProps {
  visible: boolean;
  exerciseName: string;
  totalSets: number;
  summary: LiveReviewSummary | null;
  coachFeedback: string | null;
  isFetchingCoachFeedback: boolean;
  onDone: () => void;
  onDiscard: () => void;
}

interface StatRowProps {
  icon: keyof typeof Feather.glyphMap;
  value: string | number;
  label: string;
}

// One full-width row per stat instead of a side-by-side grid — four
// squeezed-in cards read as cramped, especially with a 2-3 digit value plus
// a wrapping label fighting for the same small width.
function StatRow({ icon, value, label }: StatRowProps) {
  return (
    <View className="flex-row items-center gap-3 py-2.5">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-cyan-vivid/10">
        <Feather name={icon} size={18} color="#00E5FF" />
      </View>
      <Text className="flex-1 font-body text-body text-secondary-light dark:text-secondary">{label}</Text>
      <Text className="font-display text-h3 text-primary-light dark:text-primary">{value}</Text>
    </View>
  );
}

function Separator() {
  return <View className="h-px bg-border-light dark:bg-border" />;
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
  onDiscard,
}: SessionSummaryModalProps) {
  const { t } = useTranslation();
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);

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
                {t('liveReview.summary.niceWork')}
              </Text>
              <Text className="text-center font-body text-body text-secondary-light dark:text-secondary">
                {t('liveReview.summary.sessionComplete', { name: exerciseName })}
              </Text>
            </View>

            <Card className="py-1">
              <StatRow icon="check-circle" value={summary?.totalReps ?? 0} label={t('liveReview.summary.totalReps')} />
              <Separator />
              <StatRow
                icon="layers"
                value={`${summary?.setsCompleted ?? 0}/${totalSets}`}
                label={t('liveReview.summary.sets')}
              />
              <Separator />
              <StatRow icon="bar-chart-2" value={summary?.avgFormScore ?? '—'} label={t('liveReview.summary.avgScore')} />
              <Separator />
              <StatRow icon="award" value={summary?.bestRepScore ?? '—'} label={t('liveReview.summary.bestRep')} />
            </Card>

            {(isFetchingCoachFeedback || coachFeedback) && (
              <View className="flex-row items-start gap-2 rounded-xl border border-cyan-vivid/30 bg-cyan-vivid/10 px-4 py-3">
                <Feather name="zap" size={16} color="#00E5FF" style={{ marginTop: 2 }} />
                <Text className="flex-1 font-body text-small text-primary-light dark:text-primary">
                  {isFetchingCoachFeedback ? t('liveReview.coachThinking') : coachFeedback}
                </Text>
              </View>
            )}

            <View className="gap-3">
              <Button label={t('liveReview.summary.saveSession')} onPress={onDone} />
              <Button label={t('liveReview.summary.discardSession')} variant="secondary" onPress={() => setConfirmingDiscard(true)} />
            </View>
          </ScrollView>
        </View>
      </View>

      <ConfirmModal
        visible={confirmingDiscard}
        title={t('liveReview.summary.discardConfirmTitle')}
        message={t('liveReview.summary.discardConfirmMessage')}
        confirmLabel={t('liveReview.summary.discardConfirmButton')}
        destructive
        onCancel={() => setConfirmingDiscard(false)}
        onConfirm={() => {
          setConfirmingDiscard(false);
          onDiscard();
        }}
      />
    </Modal>
  );
}
