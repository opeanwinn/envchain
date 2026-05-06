/**
 * pipeline.ts
 * Compose multiple field transformations into a single processing pipeline.
 */

export type PipelineFn<T, U> = (value: T) => U;

export type Pipeline<Input, Output> = {
  run: (value: Input) => Output;
  pipe: <Next>(fn: PipelineFn<Output, Next>) => Pipeline<Input, Next>;
};

/**
 * Creates a composable pipeline starting from an initial transformation.
 *
 * @example
 * const pipeline = createPipeline((v: string) => v.trim())
 *   .pipe((v) => v.toLowerCase())
 *   .pipe((v) => v.replace(/-/g, '_'));
 *
 * pipeline.run('  Hello-World  '); // => 'hello_world'
 */
export function createPipeline<Input, Output>(
  fn: PipelineFn<Input, Output>
): Pipeline<Input, Output> {
  return {
    run: fn,
    pipe<Next>(nextFn: PipelineFn<Output, Next>): Pipeline<Input, Next> {
      return createPipeline((value: Input) => nextFn(fn(value)));
    },
  };
}

/**
 * Composes an array of same-type transformations into a single function.
 */
export function composePipeline<T>(
  fns: Array<PipelineFn<T, T>>
): PipelineFn<T, T> {
  return (value: T): T => fns.reduce((acc, fn) => fn(acc), value);
}

/**
 * Wraps a pipeline run with a try/catch, returning a Result type.
 */
export type PipelineResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };

export function runSafe<Input, Output>(
  pipeline: Pipeline<Input, Output>,
  value: Input
): PipelineResult<Output> {
  try {
    return { ok: true, value: pipeline.run(value) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}
