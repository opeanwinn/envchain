import {
  inspectField,
  inspectEnv,
  formatInspectionReport,
} from './envInspect';
import { createInspectMiddleware, createSummaryInspectMiddleware } from './envInspectMiddleware';

describe('inspectField', () => {
  it('marks present fields correctly', () => {
    const result = inspectField('PORT', 3000);
    expect(result.isPresent).toBe(true);
    expect(result.type).toBe('number');
    expect(result.value).toBe(3000);
  });

  it('marks missing fields correctly', () => {
    const result = inspectField('PORT', undefined);
    expect(result.isPresent).toBe(false);
    expect(result.type).toBe('undefined');
  });

  it('masks secret fields by default', () => {
    const result = inspectField('API_SECRET', 'abc123');
    expect(result.isMasked).toBe(true);
    expect(result.value).toBe('***');
  });

  it('does not mask when maskSecrets is false', () => {
    const result = inspectField('API_SECRET', 'abc123', false);
    expect(result.isMasked).toBe(false);
    expect(result.value).toBe('abc123');
  });

  it('does not mask missing secret fields', () => {
    const result = inspectField('API_TOKEN', undefined);
    expect(result.value).toBeUndefined();
  });
});

describe('inspectEnv', () => {
  const env = { PORT: 3000, DB_PASSWORD: 'secret', MISSING: undefined };

  it('returns correct totals', () => {
    const report = inspectEnv(env);
    expect(report.total).toBe(3);
    expect(report.present).toBe(2);
    expect(report.missing).toBe(1);
  });

  it('includes all fields in report', () => {
    const report = inspectEnv(env);
    expect(report.fields).toHaveLength(3);
  });
});

describe('formatInspectionReport', () => {
  it('formats report as string', () => {
    const report = inspectEnv({ PORT: 3000, SECRET: 'x' });
    const output = formatInspectionReport(report);
    expect(output).toContain('2/2 fields present');
    expect(output).toContain('PORT');
  });

  it('notes missing fields', () => {
    const report = inspectEnv({ PORT: undefined });
    const output = formatInspectionReport(report);
    expect(output).toContain('Missing fields: 1');
  });
});

describe('createInspectMiddleware', () => {
  it('passes env through unchanged', () => {
    const middleware = createInspectMiddleware();
    const env = { PORT: '3000' };
    expect(middleware(env)).toEqual(env);
  });

  it('calls onInspect hook with report', () => {
    const onInspect = jest.fn();
    const middleware = createInspectMiddleware({ onInspect });
    middleware({ PORT: '3000', DB_TOKEN: 'abc' });
    expect(onInspect).toHaveBeenCalledTimes(1);
    const report = onInspect.mock.calls[0][0];
    expect(report.total).toBe(2);
  });
});

describe('createSummaryInspectMiddleware', () => {
  it('returns a middleware function', () => {
    const mw = createSummaryInspectMiddleware('Test');
    expect(typeof mw).toBe('function');
  });

  it('passes env through unchanged', () => {
    const mw = createSummaryInspectMiddleware();
    const env = { FOO: 'bar' };
    expect(mw(env)).toEqual(env);
  });
});
