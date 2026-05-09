/**
 * envAuditMiddleware.ts
 * Middleware that records audit events when env values are read or written.
 */

import {
  AuditRegistry,
  createAuditRegistry,
  recordAuditEvent,
} from './envAudit';

export interface AuditMiddlewareOptions {
  source?: string;
  trackReads?: boolean;
  trackWrites?: boolean;
  trackMissing?: boolean;
}

export function createAuditMiddleware(
  registry: AuditRegistry,
  options: AuditMiddlewareOptions = {}
) {
  const {
    source,
    trackReads = true,
    trackWrites = true,
    trackMissing = true,
  } = options;

  return function auditMiddleware(
    env: Record<string, string | undefined>
  ): Record<string, string | undefined> {
    const result: Record<string, string | undefined> = {};

    for (const key of Object.keys(env)) {
      const value = env[key];
      if (value === undefined) {
        if (trackMissing) {
          recordAuditEvent(registry, key, 'missing', undefined, source);
        }
      } else {
        if (trackReads) {
          recordAuditEvent(registry, key, 'read', value, source);
        }
      }
      result[key] = value;
    }

    return result;
  };
}

export function createWriteAuditMiddleware(
  registry: AuditRegistry,
  source?: string
) {
  return function writeAuditMiddleware(
    env: Record<string, string | undefined>
  ): Record<string, string | undefined> {
    for (const key of Object.keys(env)) {
      if (env[key] !== undefined) {
        recordAuditEvent(registry, key, 'write', env[key], source);
      }
    }
    return { ...env };
  };
}

export function createDefaultAuditMiddleware(source?: string) {
  const registry = createAuditRegistry();
  const middleware = createAuditMiddleware(registry, { source });
  return { registry, middleware };
}
