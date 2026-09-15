import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { translateExerciseName } from '@/constants/exerciseCatalog';
import { DEFAULT_EXERCISE_ICON } from '@/constants/exerciseIcons';
import type { SuggestedExercise } from '@/lib/exerciseSuggestion';

interface ExerciseSuggestionCardProps {
  exercise: SuggestedExercise;
  onAdd: () => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1.5">
      <Text
        className="text-center font-body text-small text-secondary-light dark:text-secondary"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
      {/* py, not a fixed h- — the label above already reserves its own
          line, so a fixed height on this box was fighting it for space
          instead of just growing with its own content. */}
      <View className="items-center justify-center rounded-lg border border-border-light py-2.5 dark:border-border">
        <Text className="font-body-semibold text-body text-primary-light dark:text-primary">{value}</Text>
      </View>
    </View>
  );
}

// Rendered below a chat bubble whenever the AI trainer's reply includes a
// ```exercise block (lib/exerciseSuggestion.ts) — the same compact
// sets/reps-or-seconds/weight/rest grid as the routine builder's
// RoutineExerciseCard, but read-only, plus an "Add to routine" action
// instead of editable fields/drag handle. No max-width of its own — it
// fills the same column the chat bubble itself uses (ChatBubble.tsx's
// max-w-[78%] wrapper), which is what the routine builder's version also
// relies on for room; a tighter cap here was squeezing 3-4 stat columns
// into far less width than that card was ever designed for, wrapping
// labels mid-word. w-full here relies on ChatBubble.tsx giving this card's
// parent column an explicit pixel width (not just a percentage cap) —
// see the comment there for why that distinction actually matters.
export function ExerciseSuggestionCard({ exercise, onAdd }: ExerciseSuggestionCardProps) {
  const { t } = useTranslation();
  const isTimeBased = exercise.duration_seconds != null && exercise.reps == null;

  return (
    <Card className="mt-2 w-full gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-cyan-vivid/10">
          <Feather name={DEFAULT_EXERCISE_ICON} size={16} color="#00E5FF" />
        </View>
        <Text className="flex-1 font-body-semibold text-body text-primary-light dark:text-primary" numberOfLines={2}>
          {translateExerciseName(t, exercise.name)}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Stat label={t('routineBuilder.fields.sets')} value={exercise.sets != null ? String(exercise.sets) : '—'} />
        {isTimeBased ? (
          <Stat
            label={t('routineBuilder.fields.sec')}
            value={exercise.duration_seconds != null ? String(exercise.duration_seconds) : '—'}
          />
        ) : (
          <Stat label={t('routineBuilder.fields.reps')} value={exercise.reps != null ? String(exercise.reps) : '—'} />
        )}
        {exercise.weight_kg != null && <Stat label={t('routineBuilder.fields.kg')} value={String(exercise.weight_kg)} />}
        <Stat
          label={t('routineBuilder.fields.restS')}
          value={exercise.rest_seconds != null ? String(exercise.rest_seconds) : '—'}
        />
      </View>

      <Pressable
        onPress={onAdd}
        accessibilityRole="button"
        className="h-11 flex-row items-center justify-center gap-2 rounded-xl border border-cyan-vivid/50 active:opacity-70"
      >
        <Feather name="plus" size={16} color="#00E5FF" />
        <Text className="font-body-semibold text-small text-cyan-vivid">{t('chat.addToRoutine')}</Text>
      </Pressable>
    </Card>
  );
}
