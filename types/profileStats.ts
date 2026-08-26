// Lifetime aggregates for User Info's Workout History section — distinct
// from types/dashboard.ts's DashboardStats, which is this-week-scoped.
export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  bestRepScore: number;
}

export interface ProfileStats {
  totalWorkouts: number;
  totalHours: number;
  longestStreakDays: number;
  personalRecords: PersonalRecord[];
}
