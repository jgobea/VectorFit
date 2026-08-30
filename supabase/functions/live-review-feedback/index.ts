// Deno Edge Function — short between-set coaching notes for Live Review.
// Distinct from supabase/functions/chat: single-shot (no conversation
// history, not persisted to chat_messages), and built from a structured
// summary of what QuickPose actually observed during the set that just
// finished, not free-form user text. Same manual-auth/CORS reasoning as
// supabase/functions/chat/index.ts (see [functions.live-review-feedback] in
// supabase/config.toml).
import { createClient } from 'npm:@supabase/supabase-js@^2.112.3';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.21.0';
import { withRetry } from './retry.ts';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// The pose-tracking "form score" QuickPoseThresholdCounter drives is a
// range-of-motion progress metric (it sweeps 0->100->0 every rep by design,
// see hooks/usePoseSession.ts), not a correctness score — it stays high
// even with bad form, so it isn't sent here. The real per-rep quality
// signal QuickPose exposes is its feedback strings (e.g. "keep your back
// straight"); how often each one fired this set, and whether the same one
// is still firing next set, is what's actually informative.
//
// One real failure mode this prompt exists to correct: QuickPose fires
// camera-setup corrections (stay in frame, step back, keep both arms
// visible, etc.) very often — often more often than any genuine form
// correction — even when the person is fully, clearly visible the whole
// set (confirmed: reps still counted correctly, so tracking was working).
// Left unfiltered, "most frequent correction" is almost always one of
// these, which is useless to a user trying to fix their exercise form. The
// rule below explicitly tells the model to treat that category as setup
// noise, not coaching content.
const BASE_SYSTEM_PROMPT = `You are VectorFit's AI trainer, giving one short coaching note shown
to the user in a live camera workout. You're given the exercise name, which set just finished
(and whether the whole workout just ended, or another set is coming next), reps completed vs
target, and how many times each specific correction fired during that set (from real-time pose
tracking), plus the same breakdown for the previous set if there was one.

Corrections about camera setup — staying in frame, stepping back, keeping a limb visible to the
camera, distance/angle to the camera — are NOT exercise-form feedback. Treat them as tracking
noise, not something to coach on: never lead with one, and skip them entirely if any genuine
form/technique correction also fired this set, even less often. Only mention a camera-setup
correction if it's the sole thing that fired AND reps came in well below target — otherwise ignore
it, since reps completing near target proves the person was tracked fine.

Give ONE short, specific, actionable note:
- If a genuine form/technique correction clearly recurs most, name it directly and say what to do
  about it.
- If a correction that fired last set is gone or less frequent this set, briefly acknowledge the
  improvement instead of repeating old feedback.
- If there were no genuine form corrections at all (only camera-setup ones, or none), give a brief
  note about pacing, depth, or effort instead — do not praise generically with nothing to point to,
  and do not mention camera setup unless the rule above says to.
- If the whole workout just ended, close it out — do not reference "your next set" or anything
  forward-looking; if another set is coming next, the note IS about that next set.
Do not recite raw rep counts or scores back at the user unless directly relevant to the note.
No greetings, no filler, no emojis. Max 140 characters.`;

interface UserProfileRow {
  ai_feedback_intensity: string | null;
  ai_coaching_style: string | null;
  language_preference: string | null;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
};

function buildProfileContext(profile: UserProfileRow | null): string {
  if (!profile) return '';
  const lines: string[] = [];
  if (profile.ai_coaching_style) lines.push(`Preferred coaching style: ${profile.ai_coaching_style}`);
  if (profile.ai_feedback_intensity) lines.push(`Preferred feedback intensity: ${profile.ai_feedback_intensity}`);
  const languageName = profile.language_preference ? LANGUAGE_NAMES[profile.language_preference] : null;
  if (languageName) lines.push(`Preferred language: ${languageName}`);
  if (lines.length === 0) return '';
  const languageInstruction = languageName ? `\n\nIMPORTANT: Reply in ${languageName}.` : '';
  return `\n\n${lines.join('\n')}${languageInstruction}`;
}

interface FeedbackCount {
  text: string;
  count: number;
}

interface RequestBody {
  exerciseName: string;
  setNumber: number;
  totalSets: number;
  repsCompleted: number;
  targetReps: number;
  feedbackCounts: FeedbackCount[];
  previousSetFeedbackCounts: FeedbackCount[] | null;
  isWorkoutComplete: boolean;
}

function isFeedbackCounts(value: unknown): value is FeedbackCount[] {
  return (
    Array.isArray(value) &&
    value.every(
      (c) =>
        typeof c === 'object' &&
        c !== null &&
        typeof (c as FeedbackCount).text === 'string' &&
        (c as FeedbackCount).text.length <= 200 &&
        typeof (c as FeedbackCount).count === 'number'
    )
  );
}

function isValidBody(value: unknown): value is RequestBody {
  if (typeof value !== 'object' || value === null) return false;
  const b = value as Partial<RequestBody>;
  return (
    typeof b.exerciseName === 'string' &&
    b.exerciseName.length > 0 &&
    b.exerciseName.length <= 200 &&
    typeof b.setNumber === 'number' &&
    typeof b.totalSets === 'number' &&
    typeof b.repsCompleted === 'number' &&
    typeof b.targetReps === 'number' &&
    isFeedbackCounts(b.feedbackCounts) &&
    (b.previousSetFeedbackCounts === null || isFeedbackCounts(b.previousSetFeedbackCounts)) &&
    typeof b.isWorkoutComplete === 'boolean'
  );
}

function formatCounts(counts: FeedbackCount[]): string {
  return counts.length > 0 ? counts.map((c) => `"${c.text}" (${c.count}x)`).join(', ') : 'none';
}

function buildSetSummary(body: RequestBody): string {
  const lines = [
    `Exercise: ${body.exerciseName}`,
    `Set ${body.setNumber} of ${body.totalSets} just finished.`,
    body.isWorkoutComplete
      ? 'The whole workout just ended — this is the closing note, no next set is coming.'
      : 'Another set is coming up next.',
    `Reps completed: ${body.repsCompleted} (target: ${body.targetReps})`,
    `Form corrections this set: ${formatCounts(body.feedbackCounts)}`,
  ];
  if (body.previousSetFeedbackCounts) {
    lines.push(`Form corrections previous set: ${formatCounts(body.previousSetFeedbackCounts)}`);
  }
  return lines.join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing bearer token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!isValidBody(body)) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { data: profile } = await authClient
      .from('users')
      .select('ai_feedback_intensity, ai_coaching_style, language_preference')
      .eq('id', user.id)
      .single<UserProfileRow>();

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-lite-latest',
      systemInstruction: BASE_SYSTEM_PROMPT + buildProfileContext(profile ?? null),
    });

    const result = await withRetry(() => model.generateContent(buildSetSummary(body)));
    const message = result.response.text().trim();

    return new Response(JSON.stringify({ message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Live Review feedback request failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate feedback' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
