// Dashboard-only aggregates — not a Supabase row shape, so it stays
// hand-written rather than generated (see the note in types/user.ts).
export interface DashboardStats {
  workoutsThisWeek: number;
  caloriesBurned: number;
  streakDays: number;
  personalBestFormScore: number | null;
}
