/**
 * required.ts
 * Utilities for enforcing required environment fields,
 * throwing descriptive errors when values are missing.
 */

export class MissingEnvError extends Error {
  public readonly key: string;

  constructor(key: string, message?: string) {
    super(message ?? `Missing required environment variable: "${key}"`);
    this.name = 'MissingEnvError';
    this.key = key;
  }
}

/**
 * Asserts that a raw env value is present (non-empty).
 * Throws a MissingEnvError if it is absent.
 */
export function assertPresent(
  raw: string | undefined | null,
  key: string
): string {
  if (raw === undefined || raw === null || raw.trim() === '') {
    throw new MissingEnvError(key);
  }
  return raw;
}

/**
 * Wraps a parser to first assert the value is present,
 * then run the parser. Throws MissingEnvError if absent.
 */
export function makeRequired<T>(
  parser: (raw: string) => T,
  key: string
): (raw: string | undefined) => T {
  return (raw: string | undefined): T => {
    const value = assertPresent(raw, key);
    return parser(value);
  };
}

/**
 * Validates that all listed keys are present in a given env record.
 * Returns an array of missing key names.
 */
export function findMissingKeys(
  env: Record<string, string | undefined>,
  keys: string[]
): string[] {
  return keys.filter((key) => {
    const val = env[key];
    return val === undefined || val === null || val.trim() === '';
  });
}
