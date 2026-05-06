/**
 * envWatchMiddleware.ts
 * Middleware integration for envWatch — wraps env processing
 * and triggers watchers whenever the environment snapshot changes.
 */

import { createWatchRegistry, diffAndNotify, WatchRegistry, EnvWatchCallback, EnvWatcher } from "./envWatch";

export interface WatchMiddlewareContext {
  registry: WatchRegistry;
  getPrevious: () => Record<string, string | undefined>;
}

export function createWatchMiddleware(): {
  middleware: (env: Record<string, string | undefined>) => Record<string, string | undefined>;
  watch: (key: string, callback: EnvWatchCallback) => EnvWatcher;
  watchAll: (callback: EnvWatchCallback) => EnvWatcher;
  clear: () => void;
} {
  const registry = createWatchRegistry();
  let previous: Record<string, string | undefined> = {};

  function middleware(
    env: Record<string, string | undefined>
  ): Record<string, string | undefined> {
    diffAndNotify(registry, previous, env);
    previous = { ...env };
    return env;
  }

  function watch(key: string, callback: EnvWatchCallback): EnvWatcher {
    return registry.watch(key, callback);
  }

  function watchAll(callback: EnvWatchCallback): EnvWatcher {
    return registry.watchAll(callback);
  }

  function clear(): void {
    registry.clear();
  }

  return { middleware, watch, watchAll, clear };
}

export function applyWatchMiddleware(
  env: Record<string, string | undefined>,
  context: WatchMiddlewareContext
): Record<string, string | undefined> {
  const previous = context.getPrevious();
  diffAndNotify(context.registry, previous, env);
  return env;
}
