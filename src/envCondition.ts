/**
 * envCondition.ts
 * Conditional environment variable resolution based on runtime predicates.
 */

export type EnvPredicate = (env: Record<string, string>) => boolean;

export interface ConditionalRule<T> {
  predicate: EnvPredicate;
  resolve: (env: Record<string, string>) => T;
}

/**
 * Evaluates a list of conditional rules in order, returning the first match.
 * Falls back to `fallback` if no rule matches.
 */
export function evaluateConditions<T>(
  env: Record<string, string>,
  rules: ConditionalRule<T>[],
  fallback: T
): T {
  for (const rule of rules) {
    if (rule.predicate(env)) {
      return rule.resolve(env);
    }
  }
  return fallback;
}

/**
 * Creates a predicate that checks if a key equals a given value.
 */
export function whenEquals(key: string, value: string): EnvPredicate {
  return (env) => env[key] === value;
}

/**
 * Creates a predicate that checks if a key is present and non-empty.
 */
export function whenPresent(key: string): EnvPredicate {
  return (env) => typeof env[key] === "string" && env[key].length > 0;
}

/**
 * Creates a predicate that checks if a key matches a regex pattern.
 */
export function whenMatches(key: string, pattern: RegExp): EnvPredicate {
  return (env) => pattern.test(env[key] ?? "");
}

/**
 * Combines multiple predicates with logical AND.
 */
export function allOf(...predicates: EnvPredicate[]): EnvPredicate {
  return (env) => predicates.every((p) => p(env));
}

/**
 * Combines multiple predicates with logical OR.
 */
export function anyOf(...predicates: EnvPredicate[]): EnvPredicate {
  return (env) => predicates.some((p) => p(env));
}

/**
 * Negates a predicate.
 */
export function not(predicate: EnvPredicate): EnvPredicate {
  return (env) => !predicate(env);
}
