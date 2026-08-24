// Gemini returns a transient 503 ("model experiencing high demand") often
// enough in practice that a bare pass-through was surfacing it to users as
// a hard failure. Retry only on 503, with short backoff, before giving up.
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 500
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      if (status !== 503 || attempt === maxAttempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastErr;
}
