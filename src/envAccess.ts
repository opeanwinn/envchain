/**
 * envAccess.ts
 * Provides role-based access control for environment variable keys.
 */

export type AccessLevel = 'public' | 'internal' | 'secret' | 'restricted';

export interface AccessPolicy {
  level: AccessLevel;
  allowedRoles: string[];
}

export type AccessRegistry = Record<string, AccessPolicy>;

const LEVEL_RANK: Record<AccessLevel, number> = {
  public: 0,
  internal: 1,
  secret: 2,
  restricted: 3,
};

export function createAccessRegistry(initial: AccessRegistry = {}): AccessRegistry {
  return { ...initial };
}

export function registerAccess(
  registry: AccessRegistry,
  key: string,
  policy: AccessPolicy
): AccessRegistry {
  return { ...registry, [key]: policy };
}

export function canAccess(
  registry: AccessRegistry,
  key: string,
  role: string
): boolean {
  const policy = registry[key];
  if (!policy) return true;
  return policy.allowedRoles.includes(role);
}

export function filterByRole(
  env: Record<string, string>,
  registry: AccessRegistry,
  role: string
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => canAccess(registry, key, role))
  );
}

export function getAccessLevel(
  registry: AccessRegistry,
  key: string
): AccessLevel {
  return registry[key]?.level ?? 'public';
}

export function keysAboveLevel(
  registry: AccessRegistry,
  level: AccessLevel
): string[] {
  return Object.entries(registry)
    .filter(([, policy]) => LEVEL_RANK[policy.level] > LEVEL_RANK[level])
    .map(([key]) => key);
}

export function auditAccess(
  env: Record<string, string>,
  registry: AccessRegistry,
  role: string
): { allowed: string[]; denied: string[] } {
  const allowed: string[] = [];
  const denied: string[] = [];
  for (const key of Object.keys(env)) {
    if (canAccess(registry, key, role)) {
      allowed.push(key);
    } else {
      denied.push(key);
    }
  }
  return { allowed, denied };
}
