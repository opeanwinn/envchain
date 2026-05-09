import {
  createLockRegistry,
  lockKey,
  unlockKey,
  isLocked,
  getLockEntry,
  applyLocks,
  listLockedKeys,
  lockMany,
} from './envLock';
import { createLockMiddleware, composeLockMiddlewares } from './envLockMiddleware';

describe('envLock', () => {
  it('creates an empty lock registry', () => {
    const registry = createLockRegistry();
    expect(registry.locks.size).toBe(0);
  });

  it('locks and detects a key', () => {
    const registry = createLockRegistry();
    lockKey(registry, 'API_KEY');
    expect(isLocked(registry, 'API_KEY')).toBe(true);
    expect(isLocked(registry, 'OTHER')).toBe(false);
  });

  it('stores lock entry with mode and timestamp', () => {
    const registry = createLockRegistry();
    const before = Date.now();
    lockKey(registry, 'SECRET', 'immutable');
    const entry = getLockEntry(registry, 'SECRET');
    expect(entry?.key).toBe('SECRET');
    expect(entry?.mode).toBe('immutable');
    expect(entry?.lockedAt).toBeGreaterThanOrEqual(before);
  });

  it('unlocks a key', () => {
    const registry = createLockRegistry();
    lockKey(registry, 'DB_URL');
    expect(unlockKey(registry, 'DB_URL')).toBe(true);
    expect(isLocked(registry, 'DB_URL')).toBe(false);
  });

  it('returns false when unlocking non-existent key', () => {
    const registry = createLockRegistry();
    expect(unlockKey(registry, 'MISSING')).toBe(false);
  });

  it('applyLocks preserves locked keys from current env', () => {
    const registry = createLockRegistry();
    lockKey(registry, 'API_KEY');
    const current = { API_KEY: 'original', OTHER: 'old' };
    const incoming = { API_KEY: 'overwritten', OTHER: 'new' };
    const result = applyLocks(registry, current, incoming);
    expect(result['API_KEY']).toBe('original');
    expect(result['OTHER']).toBe('new');
  });

  it('applyLocks allows new locked keys not in current', () => {
    const registry = createLockRegistry();
    lockKey(registry, 'NEW_KEY');
    const current = {};
    const incoming = { NEW_KEY: 'value' };
    const result = applyLocks(registry, current, incoming);
    expect(result['NEW_KEY']).toBe('value');
  });

  it('listLockedKeys returns all locked keys', () => {
    const registry = createLockRegistry();
    lockMany(registry, ['A', 'B', 'C']);
    expect(listLockedKeys(registry).sort()).toEqual(['A', 'B', 'C']);
  });
});

describe('createLockMiddleware', () => {
  it('creates middleware with initial locked keys', () => {
    const mw = createLockMiddleware(['API_KEY', 'SECRET']);
    expect(mw.isLocked('API_KEY')).toBe(true);
    expect(mw.isLocked('OTHER')).toBe(false);
  });

  it('apply preserves locked keys', () => {
    const mw = createLockMiddleware(['TOKEN']);
    const current = { TOKEN: 'abc123' };
    const incoming = { TOKEN: 'hacked', EXTRA: 'ok' };
    const result = mw.apply(current, incoming);
    expect(result['TOKEN']).toBe('abc123');
    expect(result['EXTRA']).toBe('ok');
  });

  it('lock adds new keys dynamically', () => {
    const mw = createLockMiddleware();
    mw.lock('DYNAMIC_KEY');
    expect(mw.isLocked('DYNAMIC_KEY')).toBe(true);
  });

  it('lockedKeys returns all locked keys', () => {
    const mw = createLockMiddleware(['X', 'Y']);
    expect(mw.lockedKeys().sort()).toEqual(['X', 'Y']);
  });
});

describe('composeLockMiddlewares', () => {
  it('composes multiple lock middlewares', () => {
    const mw1 = createLockMiddleware(['A']);
    const mw2 = createLockMiddleware(['B']);
    const composed = composeLockMiddlewares(mw1, mw2);
    const current = { A: 'original_a', B: 'original_b' };
    const incoming = { A: 'new_a', B: 'new_b', C: 'new_c' };
    const result = composed(current, incoming);
    expect(result['A']).toBe('original_a');
    expect(result['B']).toBe('original_b');
    expect(result['C']).toBe('new_c');
  });
});
