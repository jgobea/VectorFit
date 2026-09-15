import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

// Shown in place of "Today's Workout" + "Upcoming" while useRoutine() is
// still loading. Without this, both sections (and the empty state) stay
// unmounted until the fetch resolves — Quick Access and Achievements pop up
// directly under the stats card and then jump down once the routine
// arrives. Reserving roughly the same shape up front avoids that jump,
// whether the real content turns out to be a workout, a rest day, or the
// no-routine empty state.
export function RoutineSectionSkeleton() {
  const { t } = useTranslation();

  return (
    <>
      <View className="gap-3">
        <Text className="font-display text-h2 text-primary-light dark:text-primary">{t('dashboard.todaysWorkout')}</Text>
        <Card className="gap-4">
          {[0, 1, 2].map((i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <View className="flex-1 gap-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </View>
            </View>
          ))}
          <Skeleton className="mt-1 h-12 w-full rounded-xl" />
        </Card>
      </View>

      <View className="gap-3">
        <Text className="font-display text-h2 text-primary-light dark:text-primary">{t('dashboard.upcoming.title')}</Text>
        <Card className="gap-4">
          {[0, 1, 2].map((i) => (
            <View key={i} className="gap-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </View>
          ))}
        </Card>
      </View>
    </>
  );
}
