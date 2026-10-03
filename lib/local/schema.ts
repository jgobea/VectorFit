// Offline replacement for supabase/migrations/*.sql: the table shapes (column
// defaults, unique constraints, foreign keys) the local query engine in
// ./db.ts needs to behave like Postgres did. Keep in sync with the migrations
// if the real schema ever changes.

export type Row = Record<string, any>;

export interface TableDef {
  /** Values filled in on insert when the column is missing (Postgres defaults). */
  defaults: () => Row;
  /** Column sets that must be unique across rows. */
  unique: string[][];
  /** Foreign keys: column -> referenced table + delete behavior. */
  fks: Record<string, { table: string; onDelete: 'cascade' | 'restrict' | 'none' }>;
  /** Columns bumped to now() on every update (the set_updated_at trigger). */
  touchOnUpdate?: string;
}

const now = () => new Date().toISOString();

export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const TABLES: Record<string, TableDef> = {
  users: {
    defaults: () => ({
      full_name: null,
      avatar_url: null,
      age: null,
      height_cm: null,
      weight_kg: null,
      weight_updated_at: null,
      gender: null,
      body_type: null,
      primary_goal: null,
      experience_level: null,
      workout_frequency_days: null,
      injuries_limitations: null,
      ai_feedback_intensity: 'moderate',
      ai_voice_feedback_enabled: false,
      ai_voice_volume: 70,
      language_preference: 'en',
      ai_coaching_style: 'balanced',
      onboarding_completed: false,
      created_at: now(),
      updated_at: now(),
    }),
    unique: [],
    fks: {},
    touchOnUpdate: 'updated_at',
  },
  exercises: {
    defaults: () => ({
      id: uuid(),
      category: null,
      muscle_groups: [],
      equipment: null,
      difficulty: null,
      instructions: null,
      image_url: null,
      video_url: null,
      quickpose_feature: null,
      created_by: null,
      measurement_type: 'reps',
      time_mode: null,
      created_at: now(),
    }),
    unique: [],
    fks: { created_by: { table: 'users', onDelete: 'cascade' } },
  },
  routines: {
    defaults: () => ({ id: uuid(), created_at: now(), updated_at: now() }),
    unique: [['user_id']],
    fks: { user_id: { table: 'users', onDelete: 'cascade' } },
    touchOnUpdate: 'updated_at',
  },
  routine_days: {
    defaults: () => ({ id: uuid(), is_rest_day: true, notes: null, name: null }),
    unique: [['routine_id', 'day_of_week']],
    fks: { routine_id: { table: 'routines', onDelete: 'cascade' } },
  },
  routine_exercises: {
    defaults: () => ({
      id: uuid(),
      order_index: 0,
      sets: null,
      reps: null,
      weight_kg: null,
      duration_seconds: null,
      rest_seconds: null,
      icon: null,
    }),
    unique: [],
    fks: {
      routine_day_id: { table: 'routine_days', onDelete: 'cascade' },
      exercise_id: { table: 'exercises', onDelete: 'restrict' },
    },
  },
  routine_exercise_completions: {
    defaults: () => ({ id: uuid(), completed_at: now() }),
    unique: [['routine_exercise_id', 'completed_date']],
    fks: {
      user_id: { table: 'users', onDelete: 'cascade' },
      routine_exercise_id: { table: 'routine_exercises', onDelete: 'cascade' },
    },
  },
  routine_day_completions: {
    defaults: () => ({ id: uuid(), total_load_kg: null, created_at: now() }),
    unique: [['user_id', 'completed_date']],
    fks: {
      user_id: { table: 'users', onDelete: 'cascade' },
      routine_id: { table: 'routines', onDelete: 'cascade' },
    },
  },
  chat_messages: {
    defaults: () => ({ id: uuid(), created_at: now() }),
    unique: [],
    fks: { user_id: { table: 'users', onDelete: 'cascade' } },
  },
  pose_sessions: {
    defaults: () => ({
      id: uuid(),
      started_at: now(),
      ended_at: null,
      total_reps: 0,
      target_reps: null,
      avg_form_score: null,
      best_rep_score: null,
      feedback_summary: null,
      recorded: false,
      video_url: null,
      created_at: now(),
    }),
    unique: [],
    fks: {
      user_id: { table: 'users', onDelete: 'cascade' },
      exercise_id: { table: 'exercises', onDelete: 'restrict' },
    },
  },
};
