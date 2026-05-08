/**
 * envConditionMiddleware.ts
 * Middleware integration for conditional environment resolution.
 */

import {
  ConditionalRule,
  EnvPredicate,
  evaluateConditions,
  whenEquals,
} from "./envCondition";

export interface ConditionMiddlewareOptions {
  /** If true, merges resolved values into env; otherwise replaces keys selectively */
  merge?: boolean;
}

/**
 * Creates a middleware that injects key/value pairs into the env
 * when a given predicate is satisfied.
 */
export function createConditionalInjectMiddleware(
  predicate: EnvPredicate,
  inject: Record<string, string>,
  options: ConditionMiddlewareOptions = {}
) {
  return function conditionalInjectMiddleware(
    env: Record<string, string>
  ): Record<string, string> {
    if (!predicate(env)) return env;
    return options.merge === false
      ? { ...inject }
      : { ...env, ...inject };
  };
}

/**
 * Creates a middleware that selects an env overlay based on a NODE_ENV-style key.
 */
export function createProfileConditionMiddleware(
  profileKey: string,
  profiles: Record<string, Record<string, string>>
) {
  return function profileConditionMiddleware(
    env: Record<string, string>
  ): Record<string, string> {
    const activeProfile = env[profileKey];
    if (!activeProfile || !(activeProfile in profiles)) return env;
    return { ...env, ...profiles[activeProfile] };
  };
}

/**
 * Creates a middleware that resolves a single key's value conditionally.
 */
export function createConditionalKeyMiddleware<T extends string>(
  targetKey: string,
  rules: ConditionalRule<string>[],
  fallback: string
) {
  return function conditionalKeyMiddleware(
    env: Record<string, string>
  ): Record<string, string> {
    const resolved = evaluateConditions(env, rules, fallback);
    return { ...env, [targetKey]: resolved };
  };
}
