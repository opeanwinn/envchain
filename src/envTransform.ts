/**
 * envTransform.ts
 * Provides key and value transformation utilities for environment maps.
 * Supports renaming keys, transforming values, and batch operations.
 */

export type EnvMap = Record<string, string | undefined>;
export type KeyTransformer = (key: string) => string;
export type ValueTransformer = (value: string, key: string) => string;

/**
 * Renames all keys in an env map using the provided key transformer.
 */
export function transformKeys(
  env: EnvMap,
  transformer: KeyTransformer
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    result[transformer(key)] = value;
  }
  return result;
}

/**
 * Transforms all defined values in an env map using the provided value transformer.
 */
export function transformValues(
  env: EnvMap,
  transformer: ValueTransformer
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    result[key] = value !== undefined ? transformer(value, key) : undefined;
  }
  return result;
}

/**
 * Converts all keys to SCREAMING_SNAKE_CASE.
 */
export function toScreamingSnake(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s\-\.]+/g, '_')
    .toUpperCase();
}

/**
 * Converts all keys to camelCase.
 */
export function toCamelCase(key: string): string {
  return key
    .toLowerCase()
    .replace(/[_\-\.\s]+([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Applies a prefix to all keys in the env map.
 */
export function prefixKeys(env: EnvMap, prefix: string): EnvMap {
  return transformKeys(env, (key) => `${prefix}${key}`);
}

/**
 * Strips a prefix from all keys that have it; keys without the prefix are dropped.
 */
export function stripKeyPrefix(env: EnvMap, prefix: string): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      result[key.slice(prefix.length)] = value;
    }
  }
  return result;
}

/**
 * Applies both a key and value transformer to an env map in a single pass.
 */
export function transformEnv(
  env: EnvMap,
  keyTransformer: KeyTransformer,
  valueTransformer: ValueTransformer
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    const newKey = keyTransformer(key);
    result[newKey] = value !== undefined ? valueTransformer(value, key) : undefined;
  }
  return result;
}
