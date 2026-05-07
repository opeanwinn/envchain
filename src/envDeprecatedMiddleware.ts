/**
 * envDeprecatedMiddleware.ts
 * Middleware integration for deprecated environment variable warnings.
 */

import {
  DeprecationMap,
  WarnFn,
  checkDeprecations,
  createDeprecationProxy,
  filterDeprecatedKeys,
} from './envDeprecated';

export interface DeprecationMiddlewareOptions {
  /** If true, removes deprecated keys from the env object */
  strip?: boolean;
  /** If true, uses a Proxy for lazy per-access warnings instead of eager scan */
  lazy?: boolean;
  /** Custom warning function */
  warn?: WarnFn;
}

export function createDeprecationMiddleware(
  deprecations: DeprecationMap,
  options: DeprecationMiddlewareOptions = {}
) {
  const { strip = false, lazy = false, warn } = options;

  return function deprecationMiddleware(
    env: Record<string, string | undefined>
  ): Record<string, string | undefined> {
    if (lazy) {
      const proxied = createDeprecationProxy(env, deprecations, warn);
      return strip ? filterDeprecatedKeys(proxied as Record<string, string | undefined>, deprecations) : proxied as Record<string, string | undefined>;
    }

    checkDeprecations(env, deprecations, warn);
    return strip ? filterDeprecatedKeys(env, deprecations) : { ...env };
  };
}

export function mergeDeprecationMaps(...maps: DeprecationMap[]): DeprecationMap {
  return Object.assign({}, ...maps);
}
