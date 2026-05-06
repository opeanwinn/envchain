import { SchemaShape, InferSchema, defineSchema, SchemaResult } from './schema';

/**
 * Merges two schema shapes into one, with the second overriding keys from the first.
 */
export function extendSchema<A extends SchemaShape, B extends SchemaShape>(
  base: A,
  extension: B
): A & B {
  return { ...base, ...extension } as A & B;
}

/**
 * Picks a subset of keys from a schema shape.
 */
export function pickSchema<S extends SchemaShape, K extends keyof S>(
  shape: S,
  keys: K[]
): Pick<S, K> {
  const result = {} as Pick<S, K>;
  for (const key of keys) {
    result[key] = shape[key];
  }
  return result;
}

/**
 * Omits keys from a schema shape.
 */
export function omitSchema<S extends SchemaShape, K extends keyof S>(
  shape: S,
  keys: K[]
): Omit<S, K> {
  const result = { ...shape };
  for (const key of keys) {
    delete (result as Record<string, unknown>)[key as string];
  }
  return result as Omit<S, K>;
}

/**
 * Merges results from two schema parsers applied to the same env.
 */
export function mergeSchemaResults<A, B>(
  resultA: SchemaResult<A>,
  resultB: SchemaResult<B>
): SchemaResult<A & B> {
  const errors = [...resultA.errors, ...resultB.errors];
  if (errors.length > 0) {
    return { success: false, errors };
  }
  return {
    success: true,
    data: { ...resultA.data, ...resultB.data } as A & B,
    errors: [],
  };
}
