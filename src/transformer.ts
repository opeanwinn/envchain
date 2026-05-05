/**
 * Transformers for environment variable values.
 * These are applied after validation to coerce or transform values.
 */

export type TransformFn<TInput, TOutput> = (value: TInput) => TOutput;

/**
 * Parses a string value as an integer.
 */
export const toInt: TransformFn<string, number> = (value) => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Cannot transform "${value}" to integer`);
  }
  return parsed;
};

/**
 * Parses a string value as a float.
 */
export const toFloat: TransformFn<string, number> = (value) => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`Cannot transform "${value}" to float`);
  }
  return parsed;
};

/**
 * Parses a string value as a boolean.
 * Accepts: "true", "1", "yes" -> true; "false", "0", "no" -> false
 */
export const toBool: TransformFn<string, boolean> = (value) => {
  const lower = value.toLowerCase().trim();
  if (["true", "1", "yes"].includes(lower)) return true;
  if (["false", "0", "no"].includes(lower)) return false;
  throw new Error(`Cannot transform "${value}" to boolean`);
};

/**
 * Splits a comma-separated string into an array of trimmed strings.
 */
export const toArray: TransformFn<string, string[]> = (value) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

/**
 * Parses a JSON string into an object.
 */
export const toJson: TransformFn<string, unknown> = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Cannot transform "${value}" to JSON`);
  }
};

/**
 * Trims whitespace from a string value.
 */
export const trim: TransformFn<string, string> = (value) => value.trim();

/**
 * Converts a string value to uppercase.
 */
export const toUpperCase: TransformFn<string, string> = (value) =>
  value.toUpperCase();

/**
 * Converts a string value to lowercase.
 */
export const toLowerCase: TransformFn<string, string> => (value) =>
  value.toLowerCase();
