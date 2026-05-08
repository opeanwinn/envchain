/**
 * envInspectMiddleware.ts
 * Middleware integration for env inspection, allowing inspection hooks
 * to be composed into the envchain middleware pipeline.
 */

import { inspectEnv, formatInspectionReport, InspectionReport } from './envInspect';

export type InspectionHook = (report: InspectionReport) => void;

export interface InspectMiddlewareOptions {
  maskSecrets?: boolean;
  onInspect?: InspectionHook;
  printReport?: boolean;
}

export function createInspectMiddleware<T extends Record<string, unknown>>(
  options: InspectMiddlewareOptions = {}
) {
  const { maskSecrets = true, onInspect, printReport = false } = options;

  return function inspectMiddleware(env: T): T {
    const report = inspectEnv(env as Record<string, unknown>, maskSecrets);

    if (printReport) {
      console.log(formatInspectionReport(report));
    }

    if (onInspect) {
      onInspect(report);
    }

    return env;
  };
}

export function createSummaryInspectMiddleware<T extends Record<string, unknown>>(
  label = 'EnvChain'
) {
  return createInspectMiddleware<T>({
    maskSecrets: true,
    onInspect: (report) => {
      console.log(
        `[${label}] ${report.present}/${report.total} env fields resolved` +
          (report.missing > 0 ? ` (${report.missing} missing)` : '')
      );
    },
  });
}
