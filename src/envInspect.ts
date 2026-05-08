/**
 * envInspect.ts
 * Utilities for inspecting and summarizing parsed environment configurations.
 */

export interface FieldInspection {
  key: string;
  value: unknown;
  type: string;
  isPresent: boolean;
  isMasked: boolean;
}

export interface InspectionReport {
  total: number;
  present: number;
  missing: number;
  fields: FieldInspection[];
}

const SECRET_PATTERN = /secret|password|token|key|auth|credential/i;

export function inspectField(
  key: string,
  value: unknown,
  maskSecrets = true
): FieldInspection {
  const isPresent = value !== undefined && value !== null && value !== '';
  const isMasked = maskSecrets && SECRET_PATTERN.test(key);
  const type = value === null || value === undefined ? 'undefined' : typeof value;

  return {
    key,
    value: isMasked && isPresent ? '***' : value,
    type,
    isPresent,
    isMasked,
  };
}

export function inspectEnv(
  env: Record<string, unknown>,
  maskSecrets = true
): InspectionReport {
  const fields = Object.entries(env).map(([key, value]) =>
    inspectField(key, value, maskSecrets)
  );

  const present = fields.filter((f) => f.isPresent).length;

  return {
    total: fields.length,
    present,
    missing: fields.length - present,
    fields,
  };
}

export function formatInspectionReport(report: InspectionReport): string {
  const lines: string[] = [
    `Env Inspection: ${report.present}/${report.total} fields present`,
    '',
  ];

  for (const field of report.fields) {
    const status = field.isPresent ? '✓' : '✗';
    const display = field.isPresent ? String(field.value) : '(missing)';
    const masked = field.isMasked ? ' [masked]' : '';
    lines.push(`  ${status} ${field.key}: ${display}${masked}`);
  }

  if (report.missing > 0) {
    lines.push('');
    lines.push(`Missing fields: ${report.missing}`);
  }

  return lines.join('\n');
}
