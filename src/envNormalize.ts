/**
 * envNormalize.ts
 * Utilities for normalizing environment variable keys and values.
 */

export type NormalizeKeyFn = (key: string) => string;
export type NormalizeValueFn = (value: string) => string;

export interface NormalizeOptions {
  keys?: NormalizeKeyFn;
  values?: NormalizeValueFn;
}

/**
 * Converts a key to SCREAMING_SNAKE_CASE.
 */
export function toScreamingSnakeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s\-\.]+/g, '_')
    .toUpperCase();
}

/**
 * Trims whitespace from a value.
 */
export function trimValue(value: string): string {
  return value.trim();
}

/**
 * Lowercases a value.
 */
export function lowercaseValue(value: string): string {
  return value.toLowerCase();
}

/**
 * Normalizes all keys in an env map using the provided key function.
 */
export function normalizeKeys(
  env: Record<string, string>,
  fn: NormalizeKeyFn
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [fn(k), v])
  );
}

/**
 * Normalizes all values in an env map using the provided value function.
 */
export function normalizeValues(
  env: Record<string, string>,
  fn: NormalizeValueFn
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) => [k, fn(v)])
  );
}

/**
 * Applies both key and value normalization to an env map.
 */
export function normalizeEnv(
  env: Record<string, string>,
  options: NormalizeOptions = {}
): Record<string, string> {
  let result = { ...env };
  if (options.keys) {
    result = normalizeKeys(result, options.keys);
  }
  if (options.values) {
    result = normalizeValues(result, options.values);
  }
  return result;
}
