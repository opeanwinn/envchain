/**
 * envAlias.ts
 * Provides alias resolution for environment variable keys.
 * Allows multiple keys to map to a single canonical key.
 */

export type AliasMap = Record<string, string[]>;

/**
 * Builds a reverse lookup: alias -> canonical key
 */
export function buildAliasIndex(aliases: AliasMap): Record<string, string> {
  const index: Record<string, string> = {};
  for (const [canonical, aliasList] of Object.entries(aliases)) {
    for (const alias of aliasList) {
      if (alias in index) {
        throw new Error(
          `Alias "${alias}" is already mapped to "${index[alias]}". Duplicate alias detected.`
        );
      }
      index[alias] = canonical;
    }
  }
  return index;
}

/**
 * Resolves a key through the alias index, returning the canonical key if found.
 */
export function resolveAlias(
  key: string,
  aliasIndex: Record<string, string>
): string {
  return aliasIndex[key] ?? key;
}

/**
 * Applies alias resolution to a raw env object.
 * If an alias key is present and the canonical key is absent, promotes the alias value.
 */
export function applyAliases(
  env: Record<string, string | undefined>,
  aliases: AliasMap
): Record<string, string | undefined> {
  const aliasIndex = buildAliasIndex(aliases);
  const result: Record<string, string | undefined> = { ...env };

  for (const [alias, canonical] of Object.entries(aliasIndex)) {
    if (alias in env && !(canonical in env)) {
      result[canonical] = env[alias];
    }
  }

  return result;
}

/**
 * Returns all alias keys for a given canonical key.
 */
export function getAliasesFor(canonical: string, aliases: AliasMap): string[] {
  return aliases[canonical] ?? [];
}
