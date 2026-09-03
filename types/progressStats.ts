// Aggregates for app/progress.tsx — distinct from types/dashboard.ts
// (this-week-scoped) and types/profileStats.ts (lifetime totals only, no
// trends). See hooks/useProgressStats.ts for how each field is computed.
export interface DayActivity {
  dateKey: string;
  /** 0 (Sunday) - 6 (Saturday) — ActivityStrip.tsx maps this to a translated single-letter label. */
  dayOfWeek: number;
  active: boolean;
  isToday: boolean;
}

export interface WeeklyCount {
  weekLabel: string;
  count: number;
}

export interface WeeklyScore {
  weekLabel: string;
  avgFormScore: number;
}

export interface CategorySlice {
  category: string;
  sessionCount: number;
}

export interface ProgressStats {
  totalWorkouts: number;
  totalHours: number;
  currentStreakDays: number;
  longestStreakDays: number;
  last14Days: DayActivity[];
  weeklyWorkouts: WeeklyCount[];
  weeklyFormScore: WeeklyScore[];
  categoryBreakdown: CategorySlice[];
}
