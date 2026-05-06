/**
 * Type guards and runtime type checking utilities for envchain.
 */

/**
 * Checks if a value is a non-null object.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Checks if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Checks if a value is a finite number.
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Checks if a value is a safe integer.
 */
export function isSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

/**
 * Checks if a value is a boolean.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Checks if a value is undefined or null.
 */
export function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks if a value is a string that represents a valid number.
 */
export function isNumericString(value: unknown): value is string {
  if (typeof value !== 'string' || value.trim() === '') return false;
  return !Number.isNaN(Number(value));
}

/**
 * Checks if a value is a string that represents a valid boolean.
 */
export function isBooleanString(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const lower = value.trim().toLowerCase();
  return lower === 'true' || lower === 'false' || lower === '1' || lower === '0';
}

/**
 * Checks if a value is one of the allowed literal values.
 */
export function isOneOf<T extends readonly unknown[]>(
  value: unknown,
  allowed: T
): value is T[number] {
  return allowed.includes(value as T[number]);
}

/**
 * Checks if a value is an array where every element satisfies the given guard.
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(guard);
}
