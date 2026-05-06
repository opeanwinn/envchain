/**
 * envWatch.ts
 * Provides runtime watching utilities for environment variable changes.
 * Allows registering callbacks that fire when specific keys change.
 */

export type EnvWatchCallback = (key: string, oldValue: string | undefined, newValue: string | undefined) => void;

export interface EnvWatcher {
  unwatch: () => void;
}

export interface WatchRegistry {
  watch: (key: string, callback: EnvWatchCallback) => EnvWatcher;
  watchAll: (callback: EnvWatchCallback) => EnvWatcher;
  notify: (key: string, oldValue: string | undefined, newValue: string | undefined) => void;
  clear: () => void;
  size: () => number;
}

type WatchEntry = { key: string | null; callback: EnvWatchCallback };

export function createWatchRegistry(): WatchRegistry {
  const entries: Set<WatchEntry> = new Set();

  function watch(key: string, callback: EnvWatchCallback): EnvWatcher {
    const entry: WatchEntry = { key, callback };
    entries.add(entry);
    return {
      unwatch: () => entries.delete(entry),
    };
  }

  function watchAll(callback: EnvWatchCallback): EnvWatcher {
    const entry: WatchEntry = { key: null, callback };
    entries.add(entry);
    return {
      unwatch: () => entries.delete(entry),
    };
  }

  function notify(key: string, oldValue: string | undefined, newValue: string | undefined): void {
    for (const entry of entries) {
      if (entry.key === null || entry.key === key) {
        entry.callback(key, oldValue, newValue);
      }
    }
  }

  function clear(): void {
    entries.clear();
  }

  function size(): number {
    return entries.size;
  }

  return { watch, watchAll, notify, clear, size };
}

export function diffAndNotify(
  registry: WatchRegistry,
  previous: Record<string, string | undefined>,
  current: Record<string, string | undefined>
): void {
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  for (const key of allKeys) {
    const oldVal = previous[key];
    const newVal = current[key];
    if (oldVal !== newVal) {
      registry.notify(key, oldVal, newVal);
    }
  }
}
