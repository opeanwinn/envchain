/**
 * envScope.ts
 * Scoped environment views: create isolated subsets of env vars by prefix or key list.
 */

export type EnvMap = Record<string, string | undefined>;

export interface ScopeOptions {
  stripPrefix?: boolean;
}

/**
 * Creates a scoped view of an env map filtered by a key prefix.
 * Optionally strips the prefix from keys in the returned map.
 */
export function scopeByPrefix(
  env: EnvMap,
  prefix: string,
  options: ScopeOptions = {}
): EnvMap {
  const { stripPrefix = false } = options;
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(prefix)) {
      const newKey = stripPrefix ? key.slice(prefix.length) : key;
      result[newKey] = value;
    }
  }
  return result;
}

/**
 * Creates a scoped view of an env map restricted to a specific set of keys.
 */
export function scopeByKeys(env: EnvMap, keys: string[]): EnvMap {
  const result: EnvMap = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(env, key)) {
      result[key] = env[key];
    }
  }
  return result;
}

/**
 * Merges a scoped env map back into a base env, optionally re-adding a prefix.
 */
export function unscopeWithPrefix(
  scoped: EnvMap,
  prefix: string
): EnvMap {
  const result: EnvMap = {};
  for (const [key, value] of Object.entries(scoped)) {
    result[`${prefix}${key}`] = value;
  }
  return result;
}

/**
 * Creates a named scope registry for managing multiple scopes.
 */
export function createScopeRegistry() {
  const scopes = new Map<string, EnvMap>();

  return {
    define(name: string, env: EnvMap): void {
      scopes.set(name, { ...env });
    },
    get(name: string): EnvMap | undefined {
      return scopes.get(name);
    },
    has(name: string): boolean {
      return scopes.has(name);
    },
    list(): string[] {
      return Array.from(scopes.keys());
    },
    merge(name: string, env: EnvMap): void {
      const existing = scopes.get(name) ?? {};
      scopes.set(name, { ...existing, ...env });
    },
    delete(name: string): boolean {
      return scopes.delete(name);
    },
  };
}
