import {
  createAccessRegistry,
  registerAccess,
  canAccess,
  filterByRole,
  getAccessLevel,
  keysAboveLevel,
  auditAccess,
} from './envAccess';

describe('envAccess', () => {
  const registry = createAccessRegistry({
    DB_PASSWORD: { level: 'secret', allowedRoles: ['admin'] },
    API_KEY: { level: 'internal', allowedRoles: ['admin', 'service'] },
    APP_ENV: { level: 'public', allowedRoles: ['admin', 'service', 'viewer'] },
  });

  describe('canAccess', () => {
    it('allows admin to access secret key', () => {
      expect(canAccess(registry, 'DB_PASSWORD', 'admin')).toBe(true);
    });

    it('denies viewer from accessing secret key', () => {
      expect(canAccess(registry, 'DB_PASSWORD', 'viewer')).toBe(false);
    });

    it('returns true for unregistered keys', () => {
      expect(canAccess(registry, 'UNKNOWN_KEY', 'viewer')).toBe(true);
    });
  });

  describe('filterByRole', () => {
    const env = { DB_PASSWORD: 'secret', API_KEY: 'key123', APP_ENV: 'production' };

    it('filters out restricted keys for viewer', () => {
      const result = filterByRole(env, registry, 'viewer');
      expect(result).not.toHaveProperty('DB_PASSWORD');
      expect(result).not.toHaveProperty('API_KEY');
      expect(result).toHaveProperty('APP_ENV', 'production');
    });

    it('allows admin to see all keys', () => {
      const result = filterByRole(env, registry, 'admin');
      expect(Object.keys(result)).toHaveLength(3);
    });
  });

  describe('getAccessLevel', () => {
    it('returns the correct level', () => {
      expect(getAccessLevel(registry, 'DB_PASSWORD')).toBe('secret');
      expect(getAccessLevel(registry, 'APP_ENV')).toBe('public');
    });

    it('defaults to public for unknown keys', () => {
      expect(getAccessLevel(registry, 'MISSING')).toBe('public');
    });
  });

  describe('keysAboveLevel', () => {
    it('returns keys above internal level', () => {
      const keys = keysAboveLevel(registry, 'internal');
      expect(keys).toContain('DB_PASSWORD');
      expect(keys).not.toContain('API_KEY');
    });
  });

  describe('registerAccess', () => {
    it('adds a new policy without mutating original', () => {
      const updated = registerAccess(registry, 'NEW_KEY', { level: 'restricted', allowedRoles: ['admin'] });
      expect(updated).toHaveProperty('NEW_KEY');
      expect(registry).not.toHaveProperty('NEW_KEY');
    });
  });

  describe('auditAccess', () => {
    it('returns correct allowed and denied lists', () => {
      const env = { DB_PASSWORD: 'x', APP_ENV: 'prod' };
      const result = auditAccess(env, registry, 'viewer');
      expect(result.denied).toContain('DB_PASSWORD');
      expect(result.allowed).toContain('APP_ENV');
    });
  });
});
