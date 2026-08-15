export interface PoseSession {
  id: string;
  user_id: string;
  workout_session_id: string | null;
  exercise_id: string;
  started_at: string;
  ended_at: string | null;
  total_reps: number;
  target_reps: number | null;
  avg_form_score: number | null;
  best_rep_score: number | null;
  feedback_summary: string | null;
  recorded: boolean;
  video_url: string | null;
}
