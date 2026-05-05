/**
 * Built-in validators for common environment variable types.
 */

export type ValidatorFn<T> = (value: string) => T;

export class ValidationError extends Error {
  constructor(
    public readonly key: string,
    public readonly reason: string
  ) {
    super(`[envchain] Validation failed for "${key}": ${reason}`);
    this.name = 'ValidationError';
  }
}

export const validators = {
  string: (): ValidatorFn<string> => (value) => value,

  number: (): ValidatorFn<number> => (value) => {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new Error(`expected a number, got "${value}"`);
    }
    return parsed;
  },

  integer: (): ValidatorFn<number> => (value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || String(parsed) !== value.trim()) {
      throw new Error(`expected an integer, got "${value}"`);
    }
    return parsed;
  },

  boolean: (): ValidatorFn<boolean> => (value) => {
    const lower = value.toLowerCase().trim();
    if (lower === 'true' || lower === '1' || lower === 'yes') return true;
    if (lower === 'false' || lower === '0' || lower === 'no') return false;
    throw new Error(`expected a boolean (true/false/1/0/yes/no), got "${value}"`);
  },

  url: (): ValidatorFn<string> => (value) => {
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error(`expected a valid URL, got "${value}"`);
    }
  },

  enum: <T extends string>(allowed: T[]): ValidatorFn<T> => (value) => {
    if (!allowed.includes(value as T)) {
      throw new Error(`expected one of [${allowed.join(', ')}], got "${value}"`);
    }
    return value as T;
  },

  port: (): ValidatorFn<number> => (value) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
      throw new Error(`expected a valid port (1-65535), got "${value}"`);
    }
    return parsed;
  },
};
