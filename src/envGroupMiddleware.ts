/**
 * envGroupMiddleware.ts
 * Provides middleware that expands env group prefixes into
 * structured nested values before schema processing.
 */

import { extractPrefixed, EnvGroup } from "./envGroup";

export type GroupMiddlewareResult = Record<string, Record<string, string | undefined>>;

/**
 * Builds a middleware function that intercepts raw env and
 * injects group-scoped sub-records alongside original keys.
 */
export function createGroupMiddleware(
  groups: EnvGroup<Record<string, unknown>>[]
) {
  return function groupMiddleware(
    env: Record<string, string | undefined>
  ): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = { ...env };
    for (const group of groups) {
      const scoped = extractPrefixed(group.prefix, env);
      for (const [k, v] of Object.entries(scoped)) {
        const compositeKey = `${group.prefix}${k}`;
        if (!(compositeKey in result)) {
          result[compositeKey] = v;
        }
      }
    }
    return result;
  };
}

/**
 * Validates that all required keys exist within a group's scoped env.
 * Returns an array of missing key paths (prefix + key).
 */
export function validateGroupKeys(
  group: EnvGroup<Record<string, unknown>>,
  requiredKeys: string[],
  env: Record<string, string | undefined>
): string[] {
  const scoped = extractPrefixed(group.prefix, env);
  return requiredKeys
    .filter((k) => scoped[k] === undefined || scoped[k] === "")
    .map((k) => `${group.prefix}${k}`);
}

/**
 * Collapses a group-namespaced record back into a flat env record
 * using the group's prefix. Useful for serialisation or snapshot diffing.
 */
export function flattenGroupEnv(
  prefix: string,
  groupEnv: Record<string, string | undefined>
): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(groupEnv)) {
    flat[`${prefix}${k}`] = v;
  }
  return flat;
}
