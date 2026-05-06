/**
 * envGroup.ts
 * Groups related environment variables under a namespace prefix,
 * allowing structured access and validation of prefixed env keys.
 */

export interface EnvGroup<T extends Record<string, unknown>> {
  prefix: string;
  keys: (keyof T)[];
  resolve: (env: Record<string, string | undefined>) => T;
}

/**
 * Creates an env group that strips a given prefix from matching keys
 * and resolves them into a typed record.
 */
export function createEnvGroup<T extends Record<string, unknown>>(
  prefix: string,
  resolver: (scoped: Record<string, string | undefined>) => T
): EnvGroup<T> {
  return {
    prefix,
    keys: [] as (keyof T)[],
    resolve(env: Record<string, string | undefined>): T {
      const scoped = extractPrefixed(prefix, env);
      return resolver(scoped);
    },
  };
}

/**
 * Extracts all keys from env that start with the given prefix,
 * returning a new record with the prefix stripped.
 */
export function extractPrefixed(
  prefix: string,
  env: Record<string, string | undefined>
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = {};
  const upper = prefix.toUpperCase();
  for (const key of Object.keys(env)) {
    if (key.toUpperCase().startsWith(upper)) {
      const stripped = key.slice(prefix.length).replace(/^_/, "");
      result[stripped] = env[key];
    }
  }
  return result;
}

/**
 * Merges multiple env groups into a flat record,
 * namespacing each group's output under its prefix key.
 */
export function mergeEnvGroups(
  groups: EnvGroup<Record<string, unknown>>[],
  env: Record<string, string | undefined>
): Record<string, Record<string, unknown>> {
  const result: Record<string, Record<string, unknown>> = {};
  for (const group of groups) {
    result[group.prefix] = group.resolve(env);
  }
  return result;
}
