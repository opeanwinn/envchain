/**
 * envNormalizeMiddleware.ts
 * Middleware integration for env normalization.
 */

import {
  normalizeEnv,
  toScreamingSnakeKey,
  trimValue,
  NormalizeKeyFn,
  NormalizeValueFn,
  NormalizeOptions,
} from './envNormalize';

export type NormalizeMiddleware = (env: Record<string, string>) => Record<string, string>;

/**
 * Creates a middleware that normalizes env keys using the provided function.
 */
export function createKeyNormalizeMiddleware(
  fn: NormalizeKeyFn
): NormalizeMiddleware {
  return (env) => normalizeEnv(env, { keys: fn });
}

/**
 * Creates a middleware that normalizes env values using the provided function.
 */
export function createValueNormalizeMiddleware(
  fn: NormalizeValueFn
): NormalizeMiddleware {
  return (env) => normalizeEnv(env, { values: fn });
}

/**
 * Creates a middleware that applies both key and value normalization.
 */
export function createNormalizeMiddleware(
  options: NormalizeOptions
): NormalizeMiddleware {
  return (env) => normalizeEnv(env, options);
}

/**
 * A ready-to-use middleware that converts all keys to SCREAMING_SNAKE_CASE
 * and trims all values.
 */
export const defaultNormalizeMiddleware: NormalizeMiddleware = createNormalizeMiddleware({
  keys: toScreamingSnakeKey,
  values: trimValue,
});

/**
 * Composes multiple normalize middlewares into one.
 */
export function composeNormalizeMiddlewares(
  ...middlewares: NormalizeMiddleware[]
): NormalizeMiddleware {
  return (env) => middlewares.reduce((acc, mw) => mw(acc), env);
}
