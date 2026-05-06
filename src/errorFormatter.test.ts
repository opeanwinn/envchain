import {
  formatEnvError,
  formatErrorReport,
  createEnvError,
  missingKeyError,
  invalidValueError,
} from './errorFormatter';

describe('formatEnvError', () => {
  it('formats an error without a value', () => {
    const err = createEnvError('PORT', 'Required environment variable is missing');
    const result = formatEnvError(err);
    expect(result).toBe('  [PORT] Required environment variable is missing');
  });

  it('formats an error with a value', () => {
    const err = createEnvError('PORT', 'Expected number', 'abc');
    const result = formatEnvError(err);
    expect(result).toBe('  [PORT] Expected number (received: "abc")');
  });

  it('formats an error with a numeric value', () => {
    const err = createEnvError('FLAG', 'Expected boolean', 42);
    const result = formatEnvError(err);
    expect(result).toBe('  [FLAG] Expected boolean (received: 42)');
  });
});

describe('formatErrorReport', () => {
  it('returns a summary with error count', () => {
    const errors = [
      missingKeyError('DB_HOST'),
      invalidValueError('PORT', 'xyz', 'number'),
    ];
    const report = formatErrorReport(errors);
    expect(report.errors).toHaveLength(2);
    expect(report.summary).toContain('2 error(s)');
    expect(report.summary).toContain('[DB_HOST]');
    expect(report.summary).toContain('[PORT]');
  });

  it('toString returns the summary', () => {
    const report = formatErrorReport([missingKeyError('API_KEY')]);
    expect(report.toString()).toBe(report.summary);
  });

  it('handles a single error', () => {
    const report = formatErrorReport([missingKeyError('SECRET')]);
    expect(report.summary).toContain('1 error(s)');
  });
});

describe('missingKeyError', () => {
  it('creates a missing key error', () => {
    const err = missingKeyError('MY_VAR');
    expect(err.key).toBe('MY_VAR');
    expect(err.message).toContain('missing');
    expect(err.value).toBeUndefined();
  });
});

describe('invalidValueError', () => {
  it('creates an invalid value error', () => {
    const err = invalidValueError('TIMEOUT', 'bad', 'integer');
    expect(err.key).toBe('TIMEOUT');
    expect(err.message).toBe('Expected integer');
    expect(err.value).toBe('bad');
  });
});
