/**
 * aliasMiddleware.ts
 * Middleware integration for alias resolution in the envchain pipeline.
 * Wraps applyAliases so it can be used as a standard env preprocessor.
 */

import { AliasMap, applyAliases } from "./envAlias";

export type EnvRecord = Record<string, string | undefined>;

/**
 * Creates a middleware function that resolves aliases before the schema is applied.
 * Integrates with the envchain middleware pipeline.
 */
export function createAliasMiddleware(
  aliases: AliasMap
): (env: EnvRecord) => EnvRecord {
  return (env: EnvRecord): EnvRecord => {
    return applyAliases(env, aliases);
  };
}

/**
 * Merges multiple alias maps into one and returns a single middleware.
 * Useful when aliases are defined across multiple modules.
 */
export function mergeAliasMaps(...maps: AliasMap[]): AliasMap {
  const merged: AliasMap = {};
  for (const map of maps) {
    for (const [canonical, aliasList] of Object.entries(map)) {
      if (canonical in merged) {
        merged[canonical] = [...merged[canonical], ...aliasList];
      } else {
        merged[canonical] = [...aliasList];
      }
    }
  }
  return merged;
}

/**
 * Convenience: creates a middleware from multiple alias maps merged together.
 */
export function createMergedAliasMiddleware(
  ...maps: AliasMap[]
): (env: EnvRecord) => EnvRecord {
  return createAliasMiddleware(mergeAliasMaps(...maps));
}
