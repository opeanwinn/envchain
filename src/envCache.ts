/**
 * envCache.ts
 * Provides a simple caching layer for resolved environment values,
 * allowing repeated access without re-running the full pipeline.
 */

export interface CacheEntry<T> {
  value: T;
  resolvedAt: number;
  ttl: number | null; // null = never expires
}

export interface EnvCache<T extends Record<string, unknown>> {
  get<K extends keyof T>(key: K): T[K] | undefined;
  set<K extends keyof T>(key: K, value: T[K], ttl?: number): void;
  has(key: keyof T): boolean;
  invalidate(key: keyof T): void;
  invalidateAll(): void;
  snapshot(): Partial<T>;
  size(): number;
}

export function createEnvCache<T extends Record<string, unknown>>(): EnvCache<T> {
  const store = new Map<keyof T, CacheEntry<T[keyof T]>>();

  function isExpired(entry: CacheEntry<T[keyof T]>): boolean {
    if (entry.ttl === null) return false;
    return Date.now() - entry.resolvedAt > entry.ttl;
  }

  return {
    get<K extends keyof T>(key: K): T[K] | undefined {
      const entry = store.get(key) as CacheEntry<T[K]> | undefined;
      if (!entry) return undefined;
      if (isExpired(entry)) {
        store.delete(key);
        return undefined;
      }
      return entry.value;
    },

    set<K extends keyof T>(key: K, value: T[K], ttl?: number): void {
      store.set(key, {
        value,
        resolvedAt: Date.now(),
        ttl: ttl !== undefined ? ttl : null,
      } as CacheEntry<T[keyof T]>);
    },

    has(key: keyof T): boolean {
      const entry = store.get(key);
      if (!entry) return false;
      if (isExpired(entry)) {
        store.delete(key);
        return false;
      }
      return true;
    },

    invalidate(key: keyof T): void {
      store.delete(key);
    },

    invalidateAll(): void {
      store.clear();
    },

    snapshot(): Partial<T> {
      const result: Partial<T> = {};
      for (const [key, entry] of store.entries()) {
        if (!isExpired(entry)) {
          (result as Record<keyof T, unknown>)[key] = entry.value;
        }
      }
      return result;
    },

    size(): number {
      // prune expired before reporting
      for (const [key, entry] of store.entries()) {
        if (isExpired(entry)) store.delete(key);
      }
      return store.size;
    },
  };
}
