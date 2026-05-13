/**
 * envFallback.ts
 * Provides fallback chain resolution for environment variables.
 * Tries each key in order and returns the first defined, non-empty value.
 */

export type FallbackChain = string[];

export interface FallbackResult {
  key: string | null;
  value: string | undefined;
  resolved: boolean;
}

/**
 * Resolves the first available key from a fallback chain in the given env map.
 */
export function resolveWithFallback(
  env: Record<string, string | undefined>,
  chain: FallbackChain
): FallbackResult {
  for (const key of chain) {
    const value = env[key];
    if (value !== undefined && value !== "") {
      return { key, value, resolved: true };
    }
  }
  return { key: null, value: undefined, resolved: false };
}

/**
 * Builds a new env map where each target key is resolved from its fallback chain.
 */
export function applyFallbackChains(
  env: Record<string, string | undefined>,
  chains: Record<string, FallbackChain>
): Record<string, string | undefined> {
  const result: Record<string, string | undefined> = { ...env };
  for (const [target, chain] of Object.entries(chains)) {
    if (result[target] !== undefined && result[target] !== "") {
      continue;
    }
    const { value } = resolveWithFallback(env, chain);
    if (value !== undefined) {
      result[target] = value;
    }
  }
  return result;
}

/**
 * Returns the list of keys in the chain that are defined in the env.
 */
export function availableInChain(
  env: Record<string, string | undefined>,
  chain: FallbackChain
): string[] {
  return chain.filter((key) => env[key] !== undefined && env[key] !== "");
}

/**
 * Returns true if at least one key in the chain is resolvable.
 */
export function chainResolvable(
  env: Record<string, string | undefined>,
  chain: FallbackChain
): boolean {
  return chain.some((key) => env[key] !== undefined && env[key] !== "");
}
