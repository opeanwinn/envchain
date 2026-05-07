/**
 * envMerge.ts
 * Utilities for merging multiple environment sources with priority resolution.
 */

export type EnvSource = Record<string, string | undefined>;

export type MergeStrategy = "first-wins" | "last-wins" | "error-on-conflict";

export interface MergeOptions {
  strategy?: MergeStrategy;
  ignoreUndefined?: boolean;
}

export interface MergeResult {
  env: EnvSource;
  conflicts: Record<string, string[]>;
}

/**
 * Merges multiple env sources into a single record.
 * Conflict tracking is always performed regardless of strategy.
 */
export function mergeEnvSources(
  sources: EnvSource[],
  options: MergeOptions = {}
): MergeResult {
  const { strategy = "last-wins", ignoreUndefined = true } = options;
  const env: EnvSource = {};
  const conflicts: Record<string, string[]> = {};
  const seen: Record<string, string[]> = {};

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (ignoreUndefined && value === undefined) continue;

      if (key in seen) {
        if (!conflicts[key]) conflicts[key] = [...seen[key]];
        conflicts[key].push(value ?? "");
      } else {
        seen[key] = [value ?? ""];
      }

      if (strategy === "error-on-conflict" && key in env) {
        throw new Error(
          `envMerge: conflict detected for key "${key}". Existing: "${env[key]}", incoming: "${value}".`
        );
      }

      if (strategy === "first-wins") {
        if (!(key in env)) env[key] = value;
      } else {
        env[key] = value;
      }
    }
  }

  return { env, conflicts };
}

/**
 * Returns keys that differ between two env sources.
 */
export function diffEnvSources(
  base: EnvSource,
  override: EnvSource
): Record<string, { base: string | undefined; override: string | undefined }> {
  const allKeys = new Set([...Object.keys(base), ...Object.keys(override)]);
  const diff: Record<string, { base: string | undefined; override: string | undefined }> = {};

  for (const key of allKeys) {
    if (base[key] !== override[key]) {
      diff[key] = { base: base[key], override: override[key] };
    }
  }

  return diff;
}

/**
 * Picks only the specified keys from an env source.
 */
export function pickEnvKeys(source: EnvSource, keys: string[]): EnvSource {
  return keys.reduce<EnvSource>((acc, key) => {
    if (key in source) acc[key] = source[key];
    return acc;
  }, {});
}
