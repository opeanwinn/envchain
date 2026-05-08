/**
 * envTtl.ts
 * Provides time-to-live (TTL) expiry tracking for environment variable entries.
 */

export interface TtlEntry {
  value: string;
  expiresAt: number;
}

export interface TtlRegistry {
  entries: Map<string, TtlEntry>;
}

export function createTtlRegistry(): TtlRegistry {
  return { entries: new Map() };
}

export function setWithTtl(
  registry: TtlRegistry,
  key: string,
  value: string,
  ttlMs: number
): void {
  if (ttlMs <= 0) {
    throw new RangeError(`ttlMs must be a positive number, got ${ttlMs}`);
  }
  registry.entries.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function getWithTtl(
  registry: TtlRegistry,
  key: string
): string | undefined {
  const entry = registry.entries.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    registry.entries.delete(key);
    return undefined;
  }
  return entry.value;
}

export function isExpiredTtl(registry: TtlRegistry, key: string): boolean {
  const entry = registry.entries.get(key);
  if (!entry) return true;
  return Date.now() > entry.expiresAt;
}

export function evictExpired(registry: TtlRegistry): string[] {
  const evicted: string[] = [];
  const now = Date.now();
  for (const [key, entry] of registry.entries) {
    if (now > entry.expiresAt) {
      registry.entries.delete(key);
      evicted.push(key);
    }
  }
  return evicted;
}

export function snapshotTtlRegistry(
  registry: TtlRegistry
): Record<string, string> {
  const result: Record<string, string> = {};
  const now = Date.now();
  for (const [key, entry] of registry.entries) {
    if (now <= entry.expiresAt) {
      result[key] = entry.value;
    }
  }
  return result;
}

export function clearTtlRegistry(registry: TtlRegistry): void {
  registry.entries.clear();
}

/**
 * Returns the remaining TTL in milliseconds for the given key,
 * or -1 if the key does not exist or has already expired.
 */
export function getRemainingTtl(registry: TtlRegistry, key: string): number {
  const entry = registry.entries.get(key);
  if (!entry) return -1;
  const remaining = entry.expiresAt - Date.now();
  return remaining > 0 ? remaining : -1;
}
