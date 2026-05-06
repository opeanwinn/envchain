/**
 * freezeMiddleware.ts
 * Middleware integration for envchain that applies freeze/seal
 * to resolved environment objects after processing.
 */

import { applyFreeze, FreezeOptions } from "./envFreeze";

export interface FreezeMiddlewareOptions extends FreezeOptions {
  /**
   * If true, skips freezing in non-production environments.
   * Defaults to false.
   */
  productionOnly?: boolean;
}

/**
 * Creates a middleware function that freezes the resolved env object.
 *
 * @param options - Freeze behaviour options
 * @returns A middleware transform function
 */
export function createFreezeMiddleware<T extends Record<string, unknown>>(
  options: FreezeMiddlewareOptions = {}
) {
  return function freezeMiddleware(env: T): Readonly<T> | T {
    const { productionOnly = false, ...freezeOptions } = options;

    if (productionOnly && process.env.NODE_ENV !== "production") {
      return env;
    }

    return applyFreeze(env, freezeOptions);
  };
}

/**
 * A ready-to-use deep-freeze middleware with default settings.
 */
export const defaultFreezeMiddleware = createFreezeMiddleware({ deep: true });

/**
 * A seal-only middleware that prevents adding/removing keys
 * but allows value updates.
 */
export const sealMiddleware = createFreezeMiddleware({ seal: true });

/**
 * Composes freeze middleware with an existing middleware pipeline.
 *
 * @param middleware - Existing middleware transform
 * @param freezeOptions - Options for the freeze step
 * @returns A new middleware that applies the existing transform then freezes
 */
export function withFreezeMiddleware<T extends Record<string, unknown>>(
  middleware: (env: T) => T,
  freezeOptions: FreezeMiddlewareOptions = {}
): (env: T) => Readonly<T> | T {
  const freeze = createFreezeMiddleware<T>(freezeOptions);
  return (env: T) => freeze(middleware(env));
}
