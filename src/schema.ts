import { EnvSchema } from './envchain';
import { FieldPipeline } from './fieldPipeline';
import { createErrorCollector, throwIfErrors } from './errorCollector';
import { isObject } from './typeGuards';

export type SchemaShape = Record<string, FieldPipeline<unknown>>;

export type InferSchema<S extends SchemaShape> = {
  [K in keyof S]: S[K] extends FieldPipeline<infer T> ? T : never;
};

export interface SchemaResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

export function defineSchema<S extends SchemaShape>(
  shape: S
): (env: Record<string, string | undefined>) => SchemaResult<InferSchema<S>> {
  return (env: Record<string, string | undefined>): SchemaResult<InferSchema<S>> => {
    if (!isObject(env)) {
      return { success: false, errors: ['env must be a plain object'] };
    }

    const collector = createErrorCollector();
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(shape) as (keyof S)[]) {
      const pipeline = shape[key];
      const raw = env[key as string];
      try {
        result[key as string] = pipeline(raw);
      } catch (err) {
        collector.collect(err instanceof Error ? err.message : String(err));
      }
    }

    if (collector.hasErrors()) {
      return { success: false, errors: collector.getErrors() };
    }

    return { success: true, data: result as InferSchema<S>, errors: [] };
  };
}

export function parseSchema<S extends SchemaShape>(
  shape: S,
  env: Record<string, string | undefined>
): InferSchema<S> {
  const parsed = defineSchema(shape)(env);
  if (!parsed.success) {
    throwIfErrors(parsed.errors);
  }
  return parsed.data as InferSchema<S>;
}
