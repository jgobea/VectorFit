// Pure formatting helper — no Supabase/store dependency, so it lives outside
// hooks/ where INSTRUCTIONS.md reserves business-logic-with-side-effects.
export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

const QUOTES = [
  'Discipline beats motivation on the days motivation doesn’t show up.',
  'Small reps, done daily, outlast one heroic session.',
  'Form first, weight later — your future joints thank you.',
  'The workout you almost skipped is usually the one you needed most.',
  'Progress is a streak of ordinary days, not one extraordinary one.',
  'You don’t have to be extreme, just consistent.',
  'Every rep is a vote for the athlete you’re becoming.',
];

// Deterministic per day-of-year so it doesn't flicker on re-render/refresh.
export function getMotivationalQuote(date: Date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}
