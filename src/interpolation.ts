/**
 * Interpolation module: resolves references between env variables
 * within the same schema using ${VAR_NAME} syntax.
 */

export type InterpolationContext = Record<string, string | undefined>;

const INTERPOLATION_REGEX = /\$\{([^}]+)\}/g;

/**
 * Returns true if the value contains at least one interpolation token.
 */
export function hasInterpolation(value: string): boolean {
  return INTERPOLATION_REGEX.test(value);
}

/**
 * Resolves all ${KEY} references in a string using the provided context.
 * Throws if a referenced key is missing from the context.
 */
export function interpolate(
  value: string,
  context: InterpolationContext
): string {
  return value.replace(INTERPOLATION_REGEX, (match, key: string) => {
    const resolved = context[key];
    if (resolved === undefined) {
      throw new ReferenceError(
        `Interpolation failed: variable "${key}" is not defined in context`
      );
    }
    return resolved;
  });
}

/**
 * Resolves interpolations across an entire env record.
 * Values are resolved in declaration order; forward references may fail.
 */
export function interpolateAll(
  env: InterpolationContext
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(env)) {
    if (rawValue === undefined) continue;
    result[key] = hasInterpolation(rawValue)
      ? interpolate(rawValue, { ...env, ...result })
      : rawValue;
  }

  return result;
}
