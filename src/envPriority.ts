/**
 * envPriority.ts
 * Utilities for resolving environment variables from multiple sources
 * with configurable priority ordering.
 */

export type EnvSource = Record<string, string | undefined>;

export interface PriorityEntry {
  name: string;
  source: EnvSource;
  priority: number;
}

export interface ResolvedValue {
  value: string | undefined;
  sourceName: string | undefined;
}

/**
 * Sorts priority entries from highest to lowest priority.
 */
export function sortByPriority(entries: PriorityEntry[]): PriorityEntry[] {
  return [...entries].sort((a, b) => b.priority - a.priority);
}

/**
 * Resolves a single key from a list of prioritized sources.
 * Returns the value from the highest-priority source that defines it.
 */
export function resolveFromSources(
  key: string,
  entries: PriorityEntry[]
): ResolvedValue {
  const sorted = sortByPriority(entries);
  for (const entry of sorted) {
    if (entry.source[key] !== undefined) {
      return { value: entry.source[key], sourceName: entry.name };
    }
  }
  return { value: undefined, sourceName: undefined };
}

/**
 * Merges all sources into a single env map, respecting priority.
 * Higher priority sources win on key conflicts.
 */
export function mergePrioritySources(entries: PriorityEntry[]): EnvSource {
  const sorted = sortByPriority(entries);
  const result: EnvSource = {};
  // Apply lowest priority first so higher priority overwrites
  for (const entry of [...sorted].reverse()) {
    for (const [key, value] of Object.entries(entry.source)) {
      if (value !== undefined) {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Creates a priority registry for managing multiple env sources.
 */
export function createPriorityRegistry() {
  const entries: PriorityEntry[] = [];

  return {
    register(name: string, source: EnvSource, priority: number): void {
      entries.push({ name, source, priority });
    },
    resolve(key: string): ResolvedValue {
      return resolveFromSources(key, entries);
    },
    merge(): EnvSource {
      return mergePrioritySources(entries);
    },
    list(): PriorityEntry[] {
      return sortByPriority([...entries]);
    },
    clear(): void {
      entries.length = 0;
    },
  };
}
