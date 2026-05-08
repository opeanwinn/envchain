/**
 * envPriorityMiddleware.ts
 * Middleware integration for priority-based environment source resolution.
 */

import {
  EnvSource,
  PriorityEntry,
  createPriorityRegistry,
  mergePrioritySources,
} from "./envPriority";

export type EnvMiddleware<T extends EnvSource = EnvSource> = (
  env: T
) => T;

/**
 * Creates a middleware that injects a prioritized set of sources
 * into the pipeline, merging them with the incoming env.
 * The incoming env is treated as the lowest priority source unless
 * overrideIncoming is set to true.
 */
export function createPriorityMiddleware(
  sources: Array<{ name: string; source: EnvSource; priority: number }>,
  overrideIncoming = false
): EnvMiddleware {
  return (env: EnvSource): EnvSource => {
    const entries: PriorityEntry[] = [
      ...sources,
      {
        name: "__incoming__",
        source: env,
        priority: overrideIncoming ? -1 : 0,
      },
    ];
    return mergePrioritySources(entries);
  };
}

/**
 * Creates a middleware that resolves a single env map from a
 * pre-built priority registry, merging the result with incoming env.
 */
export function createRegistryMiddleware(
  registry: ReturnType<typeof createPriorityRegistry>,
  incomingPriority = 0
): EnvMiddleware {
  return (env: EnvSource): EnvSource => {
    const merged = registry.merge();
    const incomingEntry: PriorityEntry = {
      name: "__incoming__",
      source: env,
      priority: incomingPriority,
    };
    return mergePrioritySources([...registry.list(), incomingEntry]);
  };
}

/**
 * Composes multiple priority middlewares left-to-right.
 */
export function composePriorityMiddlewares(
  ...middlewares: EnvMiddleware[]
): EnvMiddleware {
  return (env: EnvSource): EnvSource =>
    middlewares.reduce((acc, mw) => mw(acc), env);
}
