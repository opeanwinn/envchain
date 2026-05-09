/**
 * envPlaceholder.ts
 * Utilities for detecting and resolving placeholder values in environment maps.
 * Placeholders are values like "<CHANGE_ME>", "TODO", or "__PLACEHOLDER__" that
 * indicate the variable has not been properly configured.
 */

export type PlaceholderPattern = string | RegExp;

export interface PlaceholderOptions {
  patterns?: PlaceholderPattern[];
  strict?: boolean;
}

const DEFAULT_PATTERNS: RegExp[] = [
  /^<[^>]+>$/,
  /^__[A-Z_]+__$/,
  /^\$\{[^}]+\}$/,
  /^TODO$/i,
  /^CHANGE[_-]?ME$/i,
  /^PLACEHOLDER$/i,
  /^YOUR[_-]/i,
];

export function isPlaceholder(
  value: string,
  patterns: PlaceholderPattern[] = DEFAULT_PATTERNS
): boolean {
  return patterns.some((pattern) =>
    typeof pattern === "string"
      ? value === pattern
      : pattern.test(value)
  );
}

export function findPlaceholderKeys(
  env: Record<string, string>,
  patterns: PlaceholderPattern[] = DEFAULT_PATTERNS
): string[] {
  return Object.entries(env)
    .filter(([, value]) => isPlaceholder(value, patterns))
    .map(([key]) => key);
}

export function stripPlaceholders(
  env: Record<string, string>,
  patterns: PlaceholderPattern[] = DEFAULT_PATTERNS
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).filter(([, value]) => !isPlaceholder(value, patterns))
  );
}

export function assertNoPlaceholders(
  env: Record<string, string>,
  patterns: PlaceholderPattern[] = DEFAULT_PATTERNS
): void {
  const keys = findPlaceholderKeys(env, patterns);
  if (keys.length > 0) {
    throw new Error(
      `Environment contains unresolved placeholder values for keys: ${keys.join(", ")}`
    );
  }
}

export function replacePlaceholders(
  env: Record<string, string>,
  replacements: Record<string, string>,
  patterns: PlaceholderPattern[] = DEFAULT_PATTERNS
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => [
      key,
      isPlaceholder(value, patterns) && key in replacements
        ? replacements[key]
        : value,
    ])
  );
}
