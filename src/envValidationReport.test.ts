import {
  buildFieldReport,
  buildValidationReport,
  printValidationReport,
  FieldReport,
} from './envValidationReport';
import { EnvError } from './errorFormatter';

describe('buildFieldReport', () => {
  it('returns ok status when value is present and no error', () => {
    const report = buildFieldReport('PORT', 3000);
    expect(report.status).toBe('ok');
    expect(report.value).toBe(3000);
    expect(report.error).toBeUndefined();
  });

  it('returns missing status when value is undefined and no error', () => {
    const report = buildFieldReport('PORT', undefined);
    expect(report.status).toBe('missing');
  });

  it('returns missing status when error type is missing', () => {
    const err: EnvError = { type: 'missing', key: 'PORT', message: 'PORT is required' };
    const report = buildFieldReport('PORT', undefined, err);
    expect(report.status).toBe('missing');
    expect(report.error).toBe('PORT is required');
  });

  it('returns invalid status when error type is invalid', () => {
    const err: EnvError = { type: 'invalid', key: 'PORT', message: 'Expected number' };
    const report = buildFieldReport('PORT', 'abc', err);
    expect(report.status).toBe('invalid');
    expect(report.error).toBe('Expected number');
  });
});

describe('buildValidationReport', () => {
  it('returns valid=true when no errors', () => {
    const fields: FieldReport[] = [
      { key: 'HOST', status: 'ok', value: 'localhost' },
      { key: 'PORT', status: 'ok', value: 8080 },
    ];
    const report = buildValidationReport(fields);
    expect(report.valid).toBe(true);
    expect(report.errorCount).toBe(0);
  });

  it('returns valid=false when errors exist', () => {
    const fields: FieldReport[] = [
      { key: 'HOST', status: 'missing', error: 'HOST is required' },
      { key: 'PORT', status: 'ok', value: 8080 },
    ];
    const report = buildValidationReport(fields);
    expect(report.valid).toBe(false);
    expect(report.errorCount).toBe(1);
  });

  it('counts default fields as warnings', () => {
    const fields: FieldReport[] = [
      { key: 'LOG_LEVEL', status: 'default', value: 'info' },
    ];
    const report = buildValidationReport(fields);
    expect(report.warningCount).toBe(1);
    expect(report.valid).toBe(true);
  });
});

describe('printValidationReport', () => {
  it('includes summary and field lines', () => {
    const fields: FieldReport[] = [
      { key: 'HOST', status: 'ok', value: 'localhost' },
      { key: 'SECRET', status: 'missing', error: 'SECRET is required' },
    ];
    const report = buildValidationReport(fields);
    const output = printValidationReport(report);
    expect(output).toContain('[OK] HOST');
    expect(output).toContain('[MISSING] SECRET');
    expect(output).toContain('SECRET is required');
  });

  it('prints success summary when all valid', () => {
    const fields: FieldReport[] = [{ key: 'PORT', status: 'ok', value: 80 }];
    const report = buildValidationReport(fields);
    const output = printValidationReport(report);
    expect(output).toContain('successfully');
  });
});
