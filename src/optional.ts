/**
 * optional.ts
 * Utilities for marking environment fields as optional,
 * returning undefined instead of throwing when a value is absent.
 */

export type OptionalResult<T> = T | undefined;

/**
 * Wraps a parser so that if the raw value is absent or empty,
 * it returns `undefined` rather than throwing.
 */
export function makeOptional<T>(
  parser: (raw: string) => T
): (raw: string | undefined) => OptionalResult<T> {
  return (raw: string | undefined): OptionalResult<T> => {
    if (raw === undefined || raw === null || raw.trim() === '') {
      return undefined;
    }
    return parser(raw);
  };
}

/**
 * Returns true if the given raw env value is considered "present".
 */
export function isPresent(raw: string | undefined | null): boolean {
  return raw !== undefined && raw !== null && raw.trim() !== '';
}

/**
 * Wraps a parser so that it only runs when the value is present,
 * and returns a fallback (default: undefined) otherwise.
 */
export function optionalWithFallback<T>(
  parser: (raw: string) => T,
  fallback?: T
): (raw: string | undefined) => T | undefined {
  return (raw: string | undefined): T | undefined => {
    if (!isPresent(raw)) {
      return fallback;
    }
    return parser(raw as string);
  };
}
