/**
 * fieldPipeline.ts
 * Integrates the pipeline system with envchain field definitions,
 * allowing fields to declare a processing pipeline for their raw string values.
 */

import { createPipeline, Pipeline, runSafe } from './pipeline';

export type FieldPipelineOptions<T> = {
  /** Human-readable name for error messages */
  name: string;
  /** The composed pipeline that converts a raw string to T */
  pipeline: Pipeline<string, T>;
  /** Optional fallback value if the env var is absent */
  fallback?: T;
};

export type FieldPipelineResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/**
 * Resolves an environment variable through a field pipeline.
 *
 * @param rawValue - The raw string from process.env (or undefined).
 * @param options  - Pipeline options including name, pipeline, and optional fallback.
 */
export function resolveFieldPipeline<T>(
  rawValue: string | undefined,
  options: FieldPipelineOptions<T>
): FieldPipelineResult<T> {
  if (rawValue === undefined || rawValue === '') {
    if (options.fallback !== undefined) {
      return { ok: true, value: options.fallback };
    }
    return {
      ok: false,
      error: `[envchain] Missing required environment variable: "${options.name}"`,
    };
  }

  const result = runSafe(options.pipeline, rawValue);

  if (!result.ok) {
    return {
      ok: false,
      error: `[envchain] Failed to process "${options.name}": ${result.error.message}`,
    };
  }

  return { ok: true, value: result.value };
}

/**
 * Convenience builder: creates a field pipeline from a list of step functions.
 */
export function buildFieldPipeline<T>(
  firstStep: (raw: string) => T,
  ...steps: Array<(v: T) => T>
): Pipeline<string, T> {
  let p = createPipeline(firstStep);
  for (const step of steps) {
    p = p.pipe(step);
  }
  return p;
}
