import { EnvSchema } from './envchain';

export type MiddlewareFn<T> = (
  key: string,
  value: string | undefined,
  schema: EnvSchema<T>
) => string | undefined;

export type MiddlewareChain<T> = MiddlewareFn<T>[];

/**
 * Compose multiple middleware functions into a single middleware.
 * Each middleware receives the output of the previous one.
 */
export function composeMiddleware<T>(
  ...fns: MiddlewareFn<T>[]
): MiddlewareFn<T> {
  return (key, value, schema) =>
    fns.reduce<string | undefined>(
      (acc, fn) => fn(key, acc, schema),
      value
    );
}

/**
 * Apply a middleware chain to an entire env record.
 */
export function applyMiddlewareChain<T>(
  env: Record<string, string | undefined>,
  schema: EnvSchema<T>,
  chain: MiddlewareChain<T>
): Record<string, string | undefined> {
  if (chain.length === 0) return env;
  const composed = composeMiddleware(...chain);
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      composed(key, value, schema),
    ])
  );
}

/**
 * Create a middleware that trims whitespace from string values.
 */
export function trimMiddleware<T>(): MiddlewareFn<T> {
  return (_key, value) =>
    typeof value === 'string' ? value.trim() : value;
}

/**
 * Create a middleware that masks secrets in log-safe output.
 * Does not alter the actual value — used for display purposes only.
 */
export function maskMiddleware<T>(
  sensitiveKeys: string[]
): MiddlewareFn<T> {
  return (key, value) => {
    if (sensitiveKeys.includes(key) && typeof value === 'string') {
      return '***';
    }
    return value;
  };
}
