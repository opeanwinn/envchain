/**
 * envRedact.ts
 * Utilities for redacting sensitive environment variable values in logs and output.
 */

export type RedactMode = "full" | "partial" | "hash";

export interface RedactOptions {
  mode?: RedactMode;
  visibleChars?: number;
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = "[REDACTED]";
const DEFAULT_VISIBLE = 4;

/**
 * Redacts a single string value based on the given options.
 */
export function redactValue(value: string, options: RedactOptions = {}): string {
  const { mode = "full", visibleChars = DEFAULT_VISIBLE, placeholder = DEFAULT_PLACEHOLDER } = options;

  if (value.length === 0) return value;

  switch (mode) {
    case "full":
      return placeholder;

    case "partial": {
      if (value.length <= visibleChars) return placeholder;
      const visible = value.slice(-visibleChars);
      return `${'*'.repeat(value.length - visibleChars)}${visible}`;
    }

    case "hash": {
      // Simple deterministic hash for consistent output
      let h = 0;
      for (let i = 0; i < value.length; i++) {
        h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
      }
      return `[REDACTED:${(h >>> 0).toString(16).padStart(8, '0')}]`;
    }

    default:
      return placeholder;
  }
}

/**
 * Redacts matching keys from an env map.
 */
export function redactEnv(
  env: Record<string, string>,
  keys: string[],
  options: RedactOptions = {}
): Record<string, string> {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) =>
      keySet.has(k) ? [k, redactValue(v, options)] : [k, v]
    )
  );
}

/**
 * Redacts keys matching a pattern from an env map.
 */
export function redactEnvByPattern(
  env: Record<string, string>,
  pattern: RegExp,
  options: RedactOptions = {}
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([k, v]) =>
      pattern.test(k) ? [k, redactValue(v, options)] : [k, v]
    )
  );
}
