/**
 * Formats validation and parsing errors into human-readable messages.
 */

export interface EnvError {
  key: string;
  message: string;
  value?: unknown;
}

export interface FormattedErrorReport {
  summary: string;
  errors: EnvError[];
  toString(): string;
}

export function formatEnvError(error: EnvError): string {
  const valueHint =
    error.value !== undefined
      ? ` (received: ${JSON.stringify(error.value)})`
      : '';
  return `  [${error.key}] ${error.message}${valueHint}`;
}

export function formatErrorReport(
  errors: EnvError[]
): FormattedErrorReport {
  const lines = errors.map(formatEnvError);
  const summary = `Environment validation failed with ${errors.length} error(s):\n${lines.join('\n')}`;

  return {
    summary,
    errors,
    toString() {
      return this.summary;
    },
  };
}

export function createEnvError(
  key: string,
  message: string,
  value?: unknown
): EnvError {
  return { key, message, value };
}

export function missingKeyError(key: string): EnvError {
  return createEnvError(key, 'Required environment variable is missing');
}

export function invalidValueError(key: string, value: unknown, expected: string): EnvError {
  return createEnvError(key, `Expected ${expected}`, value);
}
