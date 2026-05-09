/**
 * envLock.ts
 * Provides mechanisms to lock specific environment keys, preventing
 * them from being overwritten or deleted after initial resolution.
 */

export type LockMode = 'readonly' | 'immutable';

export interface LockEntry {
  key: string;
  mode: LockMode;
  lockedAt: number;
}

export interface LockRegistry {
  locks: Map<string, LockEntry>;
}

export function createLockRegistry(): LockRegistry {
  return { locks: new Map() };
}

export function lockKey(
  registry: LockRegistry,
  key: string,
  mode: LockMode = 'readonly'
): void {
  registry.locks.set(key, { key, mode, lockedAt: Date.now() });
}

export function unlockKey(registry: LockRegistry, key: string): boolean {
  return registry.locks.delete(key);
}

export function isLocked(registry: LockRegistry, key: string): boolean {
  return registry.locks.has(key);
}

export function getLockEntry(
  registry: LockRegistry,
  key: string
): LockEntry | undefined {
  return registry.locks.get(key);
}

export function applyLocks(
  registry: LockRegistry,
  current: Record<string, string>,
  incoming: Record<string, string>
): Record<string, string> {
  const result: Record<string, string> = { ...incoming };
  for (const [key, entry] of registry.locks.entries()) {
    if (entry.mode === 'readonly' && key in current) {
      result[key] = current[key];
    } else if (entry.mode === 'immutable' && key in current) {
      result[key] = current[key];
    }
  }
  return result;
}

export function listLockedKeys(registry: LockRegistry): string[] {
  return Array.from(registry.locks.keys());
}

export function lockMany(
  registry: LockRegistry,
  keys: string[],
  mode: LockMode = 'readonly'
): void {
  for (const key of keys) {
    lockKey(registry, key, mode);
  }
}
