/**
 * envLockMiddleware.ts
 * Middleware integration for envLock — wraps env processing pipelines
 * to enforce locked key protection across transformations.
 */

import {
  createLockRegistry,
  lockKey,
  lockMany,
  applyLocks,
  isLocked,
  listLockedKeys,
  LockMode,
  LockRegistry,
} from './envLock';

export interface LockMiddleware {
  apply(
    current: Record<string, string>,
    incoming: Record<string, string>
  ): Record<string, string>;
  lock(key: string, mode?: LockMode): void;
  lockMany(keys: string[], mode?: LockMode): void;
  isLocked(key: string): boolean;
  lockedKeys(): string[];
}

export function createLockMiddleware(
  initialKeys: string[] = [],
  mode: LockMode = 'readonly'
): LockMiddleware {
  const registry: LockRegistry = createLockRegistry();

  if (initialKeys.length > 0) {
    lockMany(registry, initialKeys, mode);
  }

  return {
    apply(
      current: Record<string, string>,
      incoming: Record<string, string>
    ): Record<string, string> {
      return applyLocks(registry, current, incoming);
    },
    lock(key: string, m: LockMode = mode): void {
      lockKey(registry, key, m);
    },
    lockMany(keys: string[], m: LockMode = mode): void {
      lockMany(registry, keys, m);
    },
    isLocked(key: string): boolean {
      return isLocked(registry, key);
    },
    lockedKeys(): string[] {
      return listLockedKeys(registry);
    },
  };
}

export function composeLockMiddlewares(
  ...middlewares: LockMiddleware[]
): (current: Record<string, string>, incoming: Record<string, string>) => Record<string, string> {
  return (current, incoming) => {
    let result = incoming;
    for (const mw of middlewares) {
      result = mw.apply(current, result);
    }
    return result;
  };
}
