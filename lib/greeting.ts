// Pure formatting helper — no Supabase/store dependency, so it lives outside
// hooks/ where INSTRUCTIONS.md reserves business-logic-with-side-effects.
// Returns an i18n key (dashboard.greeting.morning/afternoon/evening), not
// display text — translation happens at the call site (useDashboard.ts),
// which has access to react-i18next's t().
export function getTimeOfDayGreetingKey(date: Date = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// Same reasoning — index into dashboard.quotes at the call site.
export const QUOTE_COUNT = 7;

// Deterministic per day-of-year so it doesn't flicker on re-render/refresh.
export function getMotivationalQuoteIndex(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return dayOfYear % QUOTE_COUNT;
}
