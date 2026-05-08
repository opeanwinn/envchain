/**
 * envAccessMiddleware.ts
 * Middleware integration for role-based env access control.
 */

import {
  AccessRegistry,
  filterByRole,
  auditAccess,
  keysAboveLevel,
  AccessLevel,
} from './envAccess';

export interface AccessMiddlewareOptions {
  role: string;
  registry: AccessRegistry;
  onDenied?: (keys: string[]) => void;
}

export function createAccessMiddleware(
  options: AccessMiddlewareOptions
): (env: Record<string, string>) => Record<string, string> {
  return (env) => {
    const { allowed, denied } = auditAccess(env, options.registry, options.role);
    if (denied.length > 0 && options.onDenied) {
      options.onDenied(denied);
    }
    return filterByRole(env, options.registry, options.role);
  };
}

export function createLevelFilterMiddleware(
  registry: AccessRegistry,
  maxLevel: AccessLevel
): (env: Record<string, string>) => Record<string, string> {
  return (env) => {
    const restricted = new Set(keysAboveLevel(registry, maxLevel));
    return Object.fromEntries(
      Object.entries(env).filter(([key]) => !restricted.has(key))
    );
  };
}

export function composeAccessMiddlewares(
  ...middlewares: Array<(env: Record<string, string>) => Record<string, string>>
): (env: Record<string, string>) => Record<string, string> {
  return (env) => middlewares.reduce((acc, mw) => mw(acc), env);
}
