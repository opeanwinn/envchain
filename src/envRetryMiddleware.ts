/**
 * envRetryMiddleware.ts
 * Middleware that wraps an env loader with retry logic.
 */

import { retryAsync, RetryOptions, withRetryFallback } from "./envRetry";

export type EnvRecord = Record<string, string | undefined>;
export type EnvLoader = () => Promise<EnvRecord> | EnvRecord;

export interface RetryMiddlewareOptions extends Partial<RetryOptions> {
  fallbackEnv?: EnvRecord;
  logErrors?: boolean;
}

export function createRetryLoaderMiddleware(
  loader: EnvLoader,
  options: RetryMiddlewareOptions = {}
): () => Promise<EnvRecord> {
  const { fallbackEnv = {}, logErrors = false, ...retryOpts } = options;

  return async () => {
    try {
      const result = await retryAsync(
        async () => {
          const env = await loader();
          if (!env || typeof env !== "object") {
            throw new Error("Loader returned invalid env object");
          }
          return env;
        },
        {
          attempts: retryOpts.attempts ?? 3,
          delayMs: retryOpts.delayMs ?? 200,
          backoff: retryOpts.backoff ?? "linear",
          onRetry: retryOpts.onRetry ??
            (logErrors
              ? (attempt, err) =>
                  console.warn(`[envRetry] Attempt ${attempt} failed: ${err.message}`)
              : undefined),
        }
      );
      return result.value;
    } catch (err) {
      if (logErrors) {
        console.error("[envRetry] All retry attempts exhausted. Using fallback env.");
      }
      return fallbackEnv;
    }
  };
}

export function createSyncRetryMiddleware(
  loader: () => EnvRecord,
  fallbackEnv: EnvRecord = {},
  attempts = 3
): EnvRecord {
  return withRetryFallback(loader, fallbackEnv, attempts);
}
