/**
 * envRetry.ts
 * Utilities for retrying environment variable loading with backoff strategies.
 */

export interface RetryOptions {
  attempts: number;
  delayMs: number;
  backoff?: "linear" | "exponential";
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RetryResult<T> {
  value: T;
  attempts: number;
  succeeded: boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  attempts: 3,
  delayMs: 100,
  backoff: "linear",
};

/**
 * Computes the delay for a given attempt number based on the backoff strategy.
 * - "exponential": delay doubles each attempt (base * 2^(attempt-1))
 * - "linear": delay increases linearly (base * attempt)
 */
function computeDelay(base: number, attempt: number, backoff: RetryOptions["backoff"]): number {
  if (backoff === "exponential") {
    return base * Math.pow(2, attempt - 1);
  }
  return base * attempt;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error = new Error("Unknown error");

  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      const value = await fn();
      return { value, attempts: attempt, succeeded: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (opts.onRetry) opts.onRetry(attempt, lastError);
      if (attempt < opts.attempts) {
        const delay = computeDelay(opts.delayMs, attempt, opts.backoff);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  throw lastError;
}

export function withRetryFallback<T>(
  fn: () => T,
  fallback: T,
  attempts = 3
): T {
  for (let i = 0; i < attempts; i++) {
    try {
      return fn();
    } catch {
      if (i === attempts - 1) return fallback;
    }
  }
  return fallback;
}

/**
 * Wraps an async function so that it automatically retries on failure
 * using the provided retry options. Returns a new function with the
 * same signature that applies retry logic transparently.
 */
export function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): () => Promise<T> {
  return () => retryAsync(fn, options).then((result) => result.value);
}
