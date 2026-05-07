/**
 * envMask.ts
 * Utilities for masking sensitive environment variable values.
 */

export type MaskOptions = {
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
};

const DEFAULT_MASK_CHAR = '*';
const DEFAULT_VISIBLE_START = 0;
const DEFAULT_VISIBLE_END = 0;

/**
 * Masks a string value, optionally revealing a prefix and/or suffix.
 */
export function maskValue(
  value: string,
  options: MaskOptions = {}
): string {
  const {
    visibleStart = DEFAULT_VISIBLE_START,
    visibleEnd = DEFAULT_VISIBLE_END,
    maskChar = DEFAULT_MASK_CHAR,
  } = options;

  if (value.length === 0) return value;

  const start = Math.min(visibleStart, value.length);
  const end = Math.min(visibleEnd, value.length - start);
  const maskLength = Math.max(0, value.length - start - end);

  const prefix = value.slice(0, start);
  const suffix = end > 0 ? value.slice(value.length - end) : '';
  const masked = maskChar.repeat(maskLength);

  return `${prefix}${masked}${suffix}`;
}

/**
 * Masks all values in a record for a given set of sensitive keys.
 */
export function maskEnv(
  env: Record<string, string>,
  sensitiveKeys: string[],
  options: MaskOptions = {}
): Record<string, string> {
  const keySet = new Set(sensitiveKeys);
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      keySet.has(key) ? maskValue(value, options) : value,
    ])
  );
}

/**
 * Returns a masked copy of the env, masking all keys that match a pattern.
 */
export function maskEnvByPattern(
  env: Record<string, string>,
  pattern: RegExp,
  options: MaskOptions = {}
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      pattern.test(key) ? maskValue(value, options) : value,
    ])
  );
}
