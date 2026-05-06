/**
 * index.ts — public API surface for envchain
 */

export { envchain } from './envchain';
export { field } from './field';

export { parseString, parseNumber, parseInteger, parseBoolean } from './parser';
export { resolveDefault, withDefault, withDefaultParser } from './defaults';
export { makeOptional, isPresent, optionalWithFallback } from './optional';
export { assertPresent, makeRequired, findMissingKeys } from './required';
export { coerce } from './coerce';
export { transform } from './transformer';

// Pipeline utilities
export { createPipeline, composePipeline, runSafe } from './pipeline';
export type { Pipeline, PipelineFn, PipelineResult } from './pipeline';
export { resolveFieldPipeline, buildFieldPipeline } from './fieldPipeline';
export type { FieldPipelineOptions, FieldPipelineResult } from './fieldPipeline';
