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

export function throwIfErrors(collector: ErrorCollector): void {
  if (collector.hasErrors()) {
    throw new Error(collector.getReport().toString());
  }
}
