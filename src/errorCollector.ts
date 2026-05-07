/**
 * Collects errors during environment parsing and exposes a structured report.
 */

import {
  EnvError,
  FormattedErrorReport,
  formatErrorReport,
  createEnvError,
} from './errorFormatter';

export interface ErrorCollector {
  add(key: string, message: string, value?: unknown): void;
  addRaw(error: EnvError): void;
  hasErrors(): boolean;
  getErrors(): EnvError[];
  getReport(): FormattedErrorReport;
  clear(): void;
}

export function createErrorCollector(): ErrorCollector {
  const errors: EnvError[] = [];

  return {
    add(key, message, value) {
      errors.push(createEnvError(key, message, value));
    },

    addRaw(error) {
      errors.push(error);
    },

    hasErrors() {
      return errors.length > 0;
    },

    getErrors() {
      return [...errors];
    },

    getReport() {
      return formatErrorReport([...errors]);
    },

    clear() {
      errors.length = 0;
    },
  };
}

/**
 * Throws an error with a formatted report if the collector contains any errors.
 * The thrown error includes all collected validation messages in a readable format.
 */
export function throwIfErrors(collector: ErrorCollector): void {
  if (collector.hasErrors()) {
    throw new Error(collector.getReport().toString());
  }
}

/**
 * Merges errors from one or more source collectors into a target collector.
 * Useful for combining results from parallel or nested parsing operations.
 */
export function mergeCollectors(
  target: ErrorCollector,
  ...sources: ErrorCollector[]
): void {
  for (const source of sources) {
    for (const error of source.getErrors()) {
      target.addRaw(error);
    }
  }
}
