import {
  buildFieldReport,
  buildValidationReport,
  ValidationReport,
  FieldReport,
} from './envValidationReport';
import { EnvError } from './errorFormatter';

export interface ReportMiddlewareOptions {
  /** If true, throws an error when the report contains validation failures */
  throwOnInvalid?: boolean;
  /** Optional callback invoked with the completed report */
  onReport?: (report: ValidationReport) => void;
}

export function createReportMiddleware<T extends Record<string, unknown>>(
  options: ReportMiddlewareOptions = {}
) {
  return function reportMiddleware(
    env: T,
    errors: EnvError[] = []
  ): { env: T; report: ValidationReport } {
    const errorMap = new Map<string, EnvError>();
    for (const err of errors) {
      errorMap.set(err.key, err);
    }

    const allKeys = new Set([
      ...Object.keys(env),
      ...errors.map((e) => e.key),
    ]);

    const fields: FieldReport[] = Array.from(allKeys).map((key) =>
      buildFieldReport(key, env[key], errorMap.get(key))
    );

    const report = buildValidationReport(fields);

    if (options.onReport) {
      options.onReport(report);
    }

    if (options.throwOnInvalid && !report.valid) {
      throw new Error(
        `[envchain] Validation report has ${report.errorCount} error(s).\n${report.summary}`
      );
    }

    return { env, report };
  };
}

export function mergeReports(
  a: ValidationReport,
  b: ValidationReport
): ValidationReport {
  const fields = [...a.fields, ...b.fields];
  return buildValidationReport(fields);
}
