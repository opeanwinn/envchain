import { EnvError } from './errorFormatter';

export type ValidationStatus = 'ok' | 'missing' | 'invalid' | 'default';

export interface FieldReport {
  key: string;
  status: ValidationStatus;
  value?: unknown;
  error?: string;
}

export interface ValidationReport {
  valid: boolean;
  fields: FieldReport[];
  errorCount: number;
  warningCount: number;
  summary: string;
}

export function buildFieldReport(
  key: string,
  value: unknown,
  error?: EnvError
): FieldReport {
  if (error) {
    const status: ValidationStatus =
      error.type === 'missing' ? 'missing' : 'invalid';
    return { key, status, error: error.message };
  }
  const status: ValidationStatus =
    value === undefined ? 'missing' : 'ok';
  return { key, status, value };
}

export function buildValidationReport(
  fields: FieldReport[]
): ValidationReport {
  const errorCount = fields.filter(
    (f) => f.status === 'missing' || f.status === 'invalid'
  ).length;
  const warningCount = fields.filter((f) => f.status === 'default').length;
  const valid = errorCount === 0;

  const summary = valid
    ? `All ${fields.length} field(s) validated successfully.`
    : `Validation failed: ${errorCount} error(s), ${warningCount} warning(s) across ${fields.length} field(s).`;

  return { valid, fields, errorCount, warningCount, summary };
}

export function printValidationReport(report: ValidationReport): string {
  const lines: string[] = [report.summary];
  for (const field of report.fields) {
    const tag = `[${field.status.toUpperCase()}]`;
    const detail = field.error
      ? ` — ${field.error}`
      : field.value !== undefined
      ? ` = ${String(field.value)}`
      : '';
    lines.push(`  ${tag} ${field.key}${detail}`);
  }
  return lines.join('\n');
}
