import { EnvSchema } from './envchain';
import { mergeEnvSources } from './envMerge';
import { preprocessEnv } from './interpolationMiddleware';

export type EnvSource = Record<string, string | undefined>;

export interface LoaderOptions {
  sources?: EnvSource[];
  overrideProcessEnv?: boolean;
  interpolate?: boolean;
  strict?: boolean;
}

/**
 * Loads environment variables from multiple sources and merges them.
 * Sources are applied in order: later sources override earlier ones.
 */
export function loadEnv(options: LoaderOptions = {}): EnvSource {
  const {
    sources = [],
    overrideProcessEnv = false,
    interpolate = true,
    strict = false,
  } = options;

  const base: EnvSource = overrideProcessEnv ? {} : { ...process.env };
  const merged = mergeEnvSources([base, ...sources]);

  if (strict) {
    for (const [key, value] of Object.entries(merged)) {
      if (value === undefined || value === '') {
        throw new Error(`[envchain] loadEnv: key "${key}" is empty or undefined`);
      }
    }
  }

  return interpolate ? preprocessEnv(merged) : merged;
}

/**
 * Creates a loader bound to a fixed set of sources.
 * Useful for testing or environment-specific bootstrapping.
 */
export function createEnvLoader(defaultSources: EnvSource[], defaultOptions: Omit<LoaderOptions, 'sources'> = {}) {
  return function load(extraSources: EnvSource[] = [], overrides: LoaderOptions = {}): EnvSource {
    return loadEnv({
      ...defaultOptions,
      ...overrides,
      sources: [...defaultSources, ...extraSources],
    });
  };
}

/**
 * Resolves env keys required by a schema from a given source.
 * Returns only the keys declared in the schema.
 */
export function pickSchemaKeys<T extends Record<string, unknown>>(
  schema: EnvSchema<T>,
  source: EnvSource
): EnvSource {
  const result: EnvSource = {};
  for (const key of Object.keys(schema)) {
    if (key in source) {
      result[key] = source[key];
    }
  }
  return result;
}
