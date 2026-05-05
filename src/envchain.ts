export type EnvSchema = Record<string, EnvFieldConfig>;

export interface EnvFieldConfig {
  required?: boolean;
  default?: string;
  validator?: (value: string) => boolean;
  transform?: (value: string) => unknown;
  description?: string;
}

export type InferSchema<T extends EnvSchema> = {
  [K in keyof T]: T[K]['transform'] extends (v: string) => infer R ? R : string;
};

export interface EnvChainResult<T> {
  data: T;
  errors: string[];
  isValid: boolean;
}

export function envchain<T extends EnvSchema>(
  schema: T,
  source: Record<string, string | undefined> = process.env
): EnvChainResult<InferSchema<T>> {
  const data: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const [key, config] of Object.entries(schema)) {
    const rawValue = source[key];

    if (rawValue === undefined || rawValue === '') {
      if (config.default !== undefined) {
        data[key] = config.transform ? config.transform(config.default) : config.default;
        continue;
      }

      if (config.required !== false) {
        errors.push(
          `Missing required environment variable: ${key}${
            config.description ? ` (${config.description})` : ''
          }`
        );
        continue;
      }

      data[key] = undefined;
      continue;
    }

    if (config.validator && !config.validator(rawValue)) {
      errors.push(`Invalid value for environment variable: ${key} = "${rawValue}"`);
      continue;
    }

    data[key] = config.transform ? config.transform(rawValue) : rawValue;
  }

  return {
    data: data as InferSchema<T>,
    errors,
    isValid: errors.length === 0,
  };
}

export function assertEnv<T extends EnvSchema>(
  schema: T,
  source?: Record<string, string | undefined>
): InferSchema<T> {
  const result = envchain(schema, source);
  if (!result.isValid) {
    throw new Error(`Environment validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`);
  }
  return result.data;
}
