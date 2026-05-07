/**
 * envProfileMiddleware.ts
 * Middleware helpers that integrate EnvProfile with the envchain middleware
 * pipeline, allowing a profile to inject or override env values before
 * schema validation runs.
 */

import { EnvProfile, ProfileRegistry, activateProfile } from "./envProfile";

export type ProfileMiddlewareFn = (
  env: Record<string, string>
) => Record<string, string>;

/**
 * Creates a middleware that merges a named profile's values into the env.
 * Profile values do NOT override existing keys by default (use `override` to
 * change this behaviour).
 */
export function createProfileMiddleware(
  registry: ProfileRegistry,
  name: string,
  options: { override?: boolean } = {}
): ProfileMiddlewareFn {
  return (env: Record<string, string>): Record<string, string> => {
    const profileEnv = activateProfile(registry, name);
    if (options.override) {
      return { ...env, ...profileEnv };
    }
    return { ...profileEnv, ...env };
  };
}

/**
 * Creates a middleware that selects a profile based on the value of a
 * discriminator key in the current env (e.g. NODE_ENV).
 */
export function createDynamicProfileMiddleware(
  registry: ProfileRegistry,
  discriminatorKey: string,
  options: { override?: boolean } = {}
): ProfileMiddlewareFn {
  return (env: Record<string, string>): Record<string, string> => {
    const profileName = env[discriminatorKey];
    if (!profileName) return env;
    try {
      const profileEnv = activateProfile(registry, profileName);
      if (options.override) {
        return { ...env, ...profileEnv };
      }
      return { ...profileEnv, ...env };
    } catch {
      // Profile not defined for this discriminator value — pass through
      return env;
    }
  };
}

/**
 * Compose multiple profile middleware functions left-to-right.
 */
export function composeProfileMiddlewares(
  ...middlewares: ProfileMiddlewareFn[]
): ProfileMiddlewareFn {
  return (env: Record<string, string>): Record<string, string> =>
    middlewares.reduce((acc, mw) => mw(acc), env);
}
