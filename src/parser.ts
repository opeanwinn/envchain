/**
 * Parsers for common environment variable value types.
 * Each parser takes a raw string value and returns a typed result.
 */

export type ParseResult<T> =
  | { success: true; value: T }
  | { success: false; error: string };

export function parseString(raw: string): ParseResult<string> {
  return { success: true, value: raw };
}

export function parseNumber(raw: string): ParseResult<number> {
  const n = Number(raw);
  if (isNaN(n)) {
    return { success: false, error: `Expected a number, got "${raw}"` };
  }
  return { success: true, value: n };
}

export function parseInteger(raw: string): ParseResult<number> {
  const result = parseNumber(raw);
  if (!result.success) return result;
  if (!Number.isInteger(result.value)) {
    return { success: false, error: `Expected an integer, got "${raw}"` };
  }
  return { success: true, value: result.value };
}

export function parseBoolean(raw: string): ParseResult<boolean> {
  const lower = raw.trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(lower)) {
    return { success: true, value: true };
  }
  if (["false", "0", "no", "off"].includes(lower)) {
    return { success: true, value: false };
  }
  return {
    success: false,
    error: `Expected a boolean (true/false/1/0/yes/no/on/off), got "${raw}"`,
  };
}

export function parseJson<T = unknown>(raw: string): ParseResult<T> {
  try {
    const value = JSON.parse(raw) as T;
    return { success: true, value };
  } catch {
    return { success: false, error: `Expected valid JSON, got "${raw}"` };
  }
}

export function parseEnum<T extends string>(
  values: readonly T[]
): (raw: string) => ParseResult<T> {
  return (raw: string) => {
    if ((values as readonly string[]).includes(raw)) {
      return { success: true, value: raw as T };
    }
    return {
      success: false,
      error: `Expected one of [${values.join(", ")}], got "${raw}"`,
    };
  };
}
