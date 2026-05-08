/**
 * envSanitize.ts
 * Utilities for sanitizing environment variable values by stripping
 * dangerous characters, trimming whitespace, and enforcing safe patterns.
 */

export type SanitizeOptions = {
  trim?: boolean;
  stripControlChars?: boolean;
  stripNullBytes?: boolean;
  maxLength?: number;
  allowedPattern?: RegExp;
};

const DEFAULT_OPTIONS: Required<Omit<SanitizeOptions, 'allowedPattern' | 'maxLength'>> = {
  trim: true,
  stripControlChars: true,
  stripNullBytes: true,
};

export function sanitizeValue(value: string, options: SanitizeOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = value;

  if (opts.stripNullBytes) {
    result = result.replace(/\0/g, '');
  }

  if (opts.stripControlChars) {
    // Strip control characters except tab (\t), newline (\n), carriage return (\r)
    result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }

  if (opts.trim) {
    result = result.trim();
  }

  if (opts.maxLength !== undefined && result.length > opts.maxLength) {
    result = result.slice(0, opts.maxLength);
  }

  if (opts.allowedPattern && !opts.allowedPattern.test(result)) {
    return '';
  }

  return result;
}

export function sanitizeEnv(
  env: Record<string, string>,
  options: SanitizeOptions = {}
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [key, sanitizeValue(value, options)])
  );
}

export function sanitizeEnvByKeys(
  env: Record<string, string>,
  keys: string[],
  options: SanitizeOptions = {}
): Record<string, string> {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) =>
      keySet.has(key) ? [key, sanitizeValue(value, options)] : [key, value]
    )
  );
}

export function isSafeValue(value: string, allowedPattern?: RegExp): boolean {
  if (/\0/.test(value)) return false;
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) return false;
  if (allowedPattern && !allowedPattern.test(value)) return false;
  return true;
}
