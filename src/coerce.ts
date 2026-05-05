/**
 * Coercers transform raw string environment variable values into typed values
 * before validation occurs. Unlike parsers which strictly parse, coercers
 * attempt to normalize/coerce values into the desired type.
 */

export type Coercer<T> = (value: string) => T;

/**
 * Coerces a string to a trimmed string.
 */
export const coerceString: Coercer<string> = (value: string): string => {
  return value.trim();
};

/**
 * Coerces a string to a number, accepting strings with whitespace or
 * numeric strings like "3.14", "42", "-7".
 */
export const coerceNumber: Coercer<number> = (value: string): number => {
  const trimmed = value.trim();
  const result = Number(trimmed);
  if (isNaN(result)) {
    throw new TypeError(`Cannot coerce "${value}" to a number`);
  }
  return result;
};

/**
 * Coerces a string to a boolean. Accepts truthy strings like
 * "true", "1", "yes", "on" and falsy strings like "false", "0", "no", "off".
 */
export const coerceBoolean: Coercer<boolean> = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  throw new TypeError(`Cannot coerce "${value}" to a boolean`);
};

/**
 * Coerces a string to an integer. Truncates decimal values.
 */
export const coerceInteger: Coercer<number> = (value: string): number => {
  const num = coerceNumber(value);
  return Math.trunc(num);
};

/**
 * Coerces a comma-separated string into an array of trimmed strings.
 * e.g. "foo, bar, baz" => ["foo", "bar", "baz"]
 */
export const coerceArray: Coercer<string[]> = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

/**
 * Coerces a string to a URL, throwing if the value is not a valid URL.
 */
export const coerceUrl: Coercer<URL> = (value: string): URL => {
  try {
    return new URL(value.trim());
  } catch {
    throw new TypeError(`Cannot coerce "${value}" to a URL`);
  }
};
