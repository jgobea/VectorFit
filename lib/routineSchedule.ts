import type { Routine, RoutineDay } from '@/types/routine';

export interface ScheduledDay {
  date: Date;
  day: RoutineDay;
}

// Local (not UTC) date key — used to scope routine_exercise_completions to
// "today" in the user's own timezone, consistently between the Dashboard
// checklist and usePoseSession's completion write on Live Review finish.
export function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// day_of_week matches JS Date#getDay() (0=Sunday..6=Saturday) — see
// supabase/migrations/20260826000000_routines.sql.
export function getTodayRoutineDay(routine: Routine): RoutineDay | null {
  const dow = new Date().getDay();
  return routine.days.find((d) => d.day_of_week === dow) ?? null;
}

export function getUpcomingRoutineDays(routine: Routine, count = 6): ScheduledDay[] {
  const today = new Date();
  const result: ScheduledDay[] = [];

  for (let offset = 1; offset <= count; offset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    const day = routine.days.find((d) => d.day_of_week === date.getDay());
    if (day) result.push({ date, day });
  }

  return result;
}
