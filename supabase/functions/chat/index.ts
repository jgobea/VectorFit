// Deno Edge Function — the only place @google/generative-ai is called from.
// GEMINI_API_KEY never reaches the client. Auth is verified manually below
// (see supabase/config.toml [functions.chat] verify_jwt = false) rather than
// at the platform level: platform-level verify_jwt rejects the CORS
// preflight OPTIONS request — which never carries an Authorization header —
// before it reaches this file, breaking every browser call.
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

// DESIGN_SPEC.md § Content Tone & Voice
const BASE_SYSTEM_PROMPT = `You are VectorFit's AI personal trainer. Tone: friendly and
motivational without being overly casual; explain form/fitness concepts
clearly and technically but simply; personalize advice using the user's
name, goals, and progress when given; celebrate wins and normalize
struggles. Keep replies concise and actionable. If you ever get asked to provide a workout plan,
respond with a short, high-level outline of the plan and a few example exercises,
but do not provide a full plan. Only talk about exercises and fitness;
do not give medical advice or discuss nutrition or talk about anything else. avoid generic,
vague, or repetitive responses; do not make up information or give advice that could be unsafe.
avoid using filler phrases like "as an AI language model" or "I'm not a medical professional."
avoid apologizing for not being able to provide information. If you don't know the answer, say so.
avoid using the user's name in a way that could be interpreted as creepy or invasive.
dont use emojis or other non-text characters as well as empty words like greetings.
The chat client renders basic markdown (**bold**, # / ## / ### headings, - bullet lists,
1. numbered lists) — you may use it, but sparingly and only where it actually
helps readability (e.g. a short exercise list); default to plain prose, since
every markdown character still costs tokens.
You'll also be given the list of exercises this app's Live Review feature
(real-time camera form-tracking during a set) currently supports. Never let
that list bias which exercises you recommend — always suggest whichever
exercises are genuinely best for the user's goal first, Live Review-tracked
or not. Use the list only to know, and mention when it's naturally relevant,
that some of the exercises you or the user are discussing can be done with
Live Review — e.g. offering "want to know which of these you can track with
Live Review?" rather than volunteering the full list unprompted.

Whenever you concretely recommend a specific exercise the user could add to
their routine (not a vague mention), append one fenced block per exercise,
exactly in this format, right after the sentence that names it:
\`\`\`exercise
{"name":"Barbell Squat","sets":3,"reps":10,"weight_kg":null,"duration_seconds":null,"rest_seconds":60}
\`\`\`
Rules for that JSON: "name" is required. Give either "reps" or
"duration_seconds" depending on whether it's rep-based or time-based (e.g.
plank) — never both, set the unused one to null. "weight_kg" is null for
bodyweight exercises. Always include "sets" and "rest_seconds" too. The app
renders this block as a real card with an "add to routine" button — so keep
the surrounding prose brief and don't restate the sets/reps/rest numbers in
words, the card already shows them. You may include more than one block in
a reply (e.g. a short routine outline), one per exercise.
max response length: 500 characters of prose — exercise blocks don't count
toward it.`;

interface UserProfileRow {
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  body_type: string | null;
  primary_goal: string | null;
  experience_level: string | null;
  workout_frequency_days: number | null;
  injuries_limitations: string | null;
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

// Renders only the fields the user actually filled in (onboarding/Profile
// are both skippable/partial) — an empty section is worse than no section.
function buildProfileContext(profile: UserProfileRow | null): string {
  if (!profile) return '';

  const lines: string[] = [];
  if (profile.full_name) lines.push(`Name: ${profile.full_name}`);
  if (profile.age) lines.push(`Age: ${profile.age}`);
  if (profile.gender) lines.push(`Gender: ${profile.gender}`);
  if (profile.height_cm) lines.push(`Height: ${profile.height_cm} cm`);
  if (profile.weight_kg) lines.push(`Weight: ${profile.weight_kg} kg`);
  if (profile.body_type) lines.push(`Body type: ${profile.body_type}`);
  if (profile.primary_goal) lines.push(`Primary goal: ${profile.primary_goal}`);
  if (profile.experience_level) lines.push(`Experience level: ${profile.experience_level}`);
  if (profile.workout_frequency_days) lines.push(`Workout frequency: ${profile.workout_frequency_days}x / week`);
  if (profile.injuries_limitations) lines.push(`Injuries / limitations: ${profile.injuries_limitations}`);
  if (profile.ai_coaching_style) lines.push(`Preferred coaching style: ${profile.ai_coaching_style}`);
  if (profile.ai_feedback_intensity) lines.push(`Preferred feedback intensity: ${profile.ai_feedback_intensity}`);

  const languageName = profile.language_preference ? LANGUAGE_NAMES[profile.language_preference] : null;
  if (languageName) lines.push(`Preferred language: ${languageName}`);

  if (lines.length === 0) return '';
  const languageInstruction = languageName
    ? `\n\nIMPORTANT: Reply in ${languageName}, regardless of what language the user writes in, unless they explicitly ask you to switch languages.`
    : '';
  return `\n\nHere is what you know about this specific user — use it to personalize your\nanswers (e.g. tailor exercise suggestions to their goal and experience level,\nrespect stated injuries/limitations, match the requested feedback intensity\nand coaching style). Do not recite this list back to them verbatim.\n${lines.join('\n')}${languageInstruction}`;
}

interface LiveReviewExerciseRow {
  name: string;
  category: string | null;
}

const UNCATEGORIZED_LABEL = 'Other';

// Grouped by category and comma-joined, not one-per-line — this list can run
// to 20-30 names and every token here is spent on every single chat request.
function buildLiveReviewContext(exercises: LiveReviewExerciseRow[]): string {
  if (exercises.length === 0) return '';

  const byCategory = new Map<string, string[]>();
  for (const e of exercises) {
    const key = e.category ?? UNCATEGORIZED_LABEL;
    const list = byCategory.get(key);
    if (list) list.push(e.name);
    else byCategory.set(key, [e.name]);
  }

  const lines = Array.from(byCategory.entries()).map(([category, names]) => `${category}: ${names.join(', ')}`);
  return `\n\nThis app's Live Review feature (real-time camera form-tracking during a set) currently supports these exercises:\n${lines.join('\n')}`;
}

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isValidMessages(value: unknown): value is IncomingMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (m) =>
        typeof m === 'object' &&
        m !== null &&
        (m as IncomingMessage).role !== undefined &&
        ((m as IncomingMessage).role === 'user' || (m as IncomingMessage).role === 'assistant') &&
        typeof (m as IncomingMessage).content === 'string' &&
        (m as IncomingMessage).content.trim().length > 0 &&
        (m as IncomingMessage).content.length <= 4000
    )
  );
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

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidMessages(messages)) {
    return new Response(JSON.stringify({ error: 'messages must be a non-empty array of {role, content}' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const [{ data: profile }, { data: liveReviewExercises }] = await Promise.all([
      authClient
        .from('users')
        .select(
          'full_name, age, gender, height_cm, weight_kg, body_type, primary_goal, experience_level, workout_frequency_days, injuries_limitations, ai_feedback_intensity, ai_coaching_style, language_preference'
        )
        .eq('id', user.id)
        .single<UserProfileRow>(),
      authClient
        .from('exercises')
        .select('name, category')
        .not('quickpose_feature', 'is', null)
        .order('category')
        .order('name')
        .returns<LiveReviewExerciseRow[]>(),
    ]);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      // Alias, not a dated snapshot (e.g. gemini-2.0-flash) — Google retires
      // dated model versions over time, which turns a hardcoded name into a
      // silent 404 well after this code was written. flash-lite over
      // flash-latest: much higher free-tier daily quota, less exposed to
      // demand-related 503s.
      model: 'gemini-flash-lite-latest',
      systemInstruction:
        BASE_SYSTEM_PROMPT + buildProfileContext(profile ?? null) + buildLiveReviewContext(liveReviewExercises ?? []),
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const latest = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await withRetry(() => chat.sendMessageStream(latest.content));

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Gemini request failed:', err);
    return new Response(JSON.stringify({ error: 'Failed to generate a response' }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
