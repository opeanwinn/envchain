/**
 * defaults.ts
 * Provides utilities for setting default values on environment fields
 * when the raw value is undefined or empty.
 */

export type DefaultValue<T> = T | (() => T);

/**
 * Resolves a default value — supports static values or factory functions.
 */
export function resolveDefault<T>(def: DefaultValue<T>): T {
  return typeof def === 'function' ? (def as () => T)() : def;
}

/**
 * Returns the original value if defined and non-empty,
 * otherwise returns the resolved default.
 */
export function withDefault<T>(
  value: T | undefined | null,
  def: DefaultValue<T>
): T {
  if (value === undefined || value === null) {
    return resolveDefault(def);
  }
  if (typeof value === 'string' && value.trim() === '') {
    return resolveDefault(def);
  }
  return value;
}

/**
 * Creates a default-aware wrapper for a parser function.
 * If the raw string is missing/empty, the default is returned directly
 * without passing through the parser.
 */
export function withDefaultParser<T>(
  parser: (raw: string) => T,
  def: DefaultValue<T>
): (raw: string | undefined) => T {
  return (raw: string | undefined): T => {
    if (raw === undefined || raw === null || raw.trim() === '') {
      return resolveDefault(def);
    }
    return parser(raw);
  };
}
