import { EnvSource, LoaderOptions, loadEnv } from './envLoader';

export type LoaderMiddleware = (source: EnvSource) => EnvSource;

/**
 * Creates a middleware that injects additional static env values
 * before the source is processed. Existing keys are NOT overwritten.
 */
export function createInjectMiddleware(injected: EnvSource): LoaderMiddleware {
  return (source) => ({ ...injected, ...source });
}

/**
 * Creates a middleware that filters env keys by a predicate.
 */
export function createFilterMiddleware(predicate: (key: string, value: string | undefined) => boolean): LoaderMiddleware {
  return (source) => {
    const result: EnvSource = {};
    for (const [key, value] of Object.entries(source)) {
      if (predicate(key, value)) {
        result[key] = value;
      }
    }
    return result;
  };
}

/**
 * Creates a middleware that renames keys according to a rename map.
 * Original keys are removed after renaming.
 */
export function createRenameMiddleware(renameMap: Record<string, string>): LoaderMiddleware {
  return (source) => {
    const result: EnvSource = { ...source };
    for (const [from, to] of Object.entries(renameMap)) {
      if (from in result) {
        result[to] = result[from];
        delete result[from];
      }
    }
    return result;
  };
}

/**
 * Composes multiple loader middlewares into a single middleware.
 * Applied left to right.
 */
export function composeLoaderMiddlewares(...middlewares: LoaderMiddleware[]): LoaderMiddleware {
  return (source) => middlewares.reduce((acc, mw) => mw(acc), source);
}

/**
 * Loads env using loadEnv options and then applies a pipeline of middlewares.
 */
export function loadEnvWithMiddleware(
  middlewares: LoaderMiddleware[],
  options: LoaderOptions = {}
): EnvSource {
  const raw = loadEnv(options);
  return composeLoaderMiddlewares(...middlewares)(raw);
}
