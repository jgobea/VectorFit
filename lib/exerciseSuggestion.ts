// Chat's structured-exercise-suggestion format: a fenced ```exercise block
// containing one JSON object, per supabase/functions/chat/index.ts's system
// prompt instructions. ChatBubble.tsx strips these out of the rendered
// prose and shows them as ExerciseSuggestionCard.tsx cards instead.
export interface SuggestedExercise {
  name: string;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
}

const BLOCK_RE = /```exercise\s*\n([\s\S]*?)\n?```/g;
// A fence that opened but hasn't closed yet — still streaming in. Stripped
// from the displayed text too, so raw JSON doesn't flash on screen
// character by character as it types out.
const UNCLOSED_BLOCK_RE = /```exercise[\s\S]*$/;

function toNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function parseBlock(raw: string): SuggestedExercise | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.name !== 'string' || !parsed.name.trim()) return null;
    return {
      name: parsed.name.trim(),
      sets: toNumber(parsed.sets),
      reps: toNumber(parsed.reps),
      weight_kg: toNumber(parsed.weight_kg),
      duration_seconds: toNumber(parsed.duration_seconds),
      rest_seconds: toNumber(parsed.rest_seconds),
    };
  } catch {
    return null;
  }
}

export function extractExerciseSuggestions(content: string): { text: string; exercises: SuggestedExercise[] } {
  const exercises: SuggestedExercise[] = [];
  const text = content
    .replace(BLOCK_RE, (_match, inner: string) => {
      const parsed = parseBlock(inner);
      if (parsed) exercises.push(parsed);
      return '';
    })
    .replace(UNCLOSED_BLOCK_RE, '')
    .trim();

  return { text, exercises };
}
