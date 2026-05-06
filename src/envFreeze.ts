/**
 * envFreeze.ts
 * Utilities for freezing and sealing resolved environment objects
 * to prevent accidental mutation at runtime.
 */

export interface FreezeOptions {
  deep?: boolean;
  seal?: boolean;
}

/**
 * Deeply freezes an object so all nested properties become immutable.
 */
export function deepFreeze<T extends object>(obj: T): Readonly<T> {
  Object.getOwnPropertyNames(obj).forEach((name) => {
    const value = (obj as Record<string, unknown>)[name];
    if (value && typeof value === "object") {
      deepFreeze(value as object);
    }
  });
  return Object.freeze(obj);
}

/**
 * Seals an object — existing properties cannot be added or removed,
 * but existing values can still be updated.
 */
export function sealEnv<T extends object>(obj: T): T {
  return Object.seal(obj);
}

/**
 * Applies freeze or seal to an env object based on options.
 */
export function applyFreeze<T extends object>(
  obj: T,
  options: FreezeOptions = {}
): Readonly<T> | T {
  const { deep = true, seal = false } = options;

  if (seal) {
    return sealEnv(obj);
  }

  if (deep) {
    return deepFreeze(obj);
  }

  return Object.freeze(obj);
}

/**
 * Returns true if the given object is frozen.
 */
export function isFrozen(obj: object): boolean {
  return Object.isFrozen(obj);
}

/**
 * Returns true if the given object is sealed.
 */
export function isSealed(obj: object): boolean {
  return Object.isSealed(obj);
}

/**
 * Creates a frozen copy of the given object without mutating the original.
 */
export function frozenCopy<T extends object>(obj: T, options: FreezeOptions = {}): Readonly<T> {
  const copy = { ...obj };
  return applyFreeze(copy, options) as Readonly<T>;
}
