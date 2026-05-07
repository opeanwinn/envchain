/**
 * envDeprecated.ts
 * Utilities for marking environment variables as deprecated,
 * emitting warnings when deprecated keys are accessed.
 */

export interface DeprecationEntry {
  key: string;
  message?: string;
  replacement?: string;
  since?: string;
}

export type DeprecationMap = Record<string, Omit<DeprecationEntry, 'key'>>;

export type WarnFn = (message: string) => void;

const defaultWarn: WarnFn = (msg) => console.warn(`[envchain] DEPRECATED: ${msg}`);

export function buildDeprecationMessage(entry: DeprecationEntry): string {
  let msg = `Environment variable "${entry.key}" is deprecated`;
  if (entry.since) msg += ` (since ${entry.since})`;
  if (entry.replacement) msg += `. Use "${entry.replacement}" instead`;
  if (entry.message) msg += `. ${entry.message}`;
  return msg;
}

export function checkDeprecations(
  env: Record<string, string | undefined>,
  deprecations: DeprecationMap,
  warn: WarnFn = defaultWarn
): void {
  for (const key of Object.keys(deprecations)) {
    if (key in env && env[key] !== undefined) {
      const entry: DeprecationEntry = { key, ...deprecations[key] };
      warn(buildDeprecationMessage(entry));
    }
  }
}

export function createDeprecationProxy(
  env: Record<string, string | undefined>,
  deprecations: DeprecationMap,
  warn: WarnFn = defaultWarn
): Record<string, string | undefined> {
  const warned = new Set<string>();
  return new Proxy(env, {
    get(target, prop: string) {
      if (prop in deprecations && !warned.has(prop) && target[prop] !== undefined) {
        warned.add(prop);
        const entry: DeprecationEntry = { key: prop, ...deprecations[prop] };
        warn(buildDeprecationMessage(entry));
      }
      return target[prop];
    },
  });
}

export function filterDeprecatedKeys(
  env: Record<string, string | undefined>,
  deprecations: DeprecationMap
): Record<string, string | undefined> {
  return Object.fromEntries(
    Object.entries(env).filter(([key]) => !(key in deprecations))
  );
}
