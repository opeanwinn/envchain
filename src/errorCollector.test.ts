import { createErrorCollector, throwIfErrors } from './errorCollector';
import { createEnvError } from './errorFormatter';

describe('createErrorCollector', () => {
  it('starts with no errors', () => {
    const collector = createErrorCollector();
    expect(collector.hasErrors()).toBe(false);
    expect(collector.getErrors()).toHaveLength(0);
  });

  it('adds errors via add()', () => {
    const collector = createErrorCollector();
    collector.add('PORT', 'Expected number', 'abc');
    expect(collector.hasErrors()).toBe(true);
    expect(collector.getErrors()).toHaveLength(1);
    expect(collector.getErrors()[0].key).toBe('PORT');
  });

  it('adds raw errors via addRaw()', () => {
    const collector = createErrorCollector();
    const err = createEnvError('HOST', 'Required but missing');
    collector.addRaw(err);
    expect(collector.hasErrors()).toBe(true);
    expect(collector.getErrors()[0]).toEqual(err);
  });

  it('returns a copy of errors, not the internal array', () => {
    const collector = createErrorCollector();
    collector.add('X', 'some error');
    const errors = collector.getErrors();
    errors.push(createEnvError('Y', 'injected'));
    expect(collector.getErrors()).toHaveLength(1);
  });

  it('clears all errors', () => {
    const collector = createErrorCollector();
    collector.add('A', 'error 1');
    collector.add('B', 'error 2');
    collector.clear();
    expect(collector.hasErrors()).toBe(false);
    expect(collector.getErrors()).toHaveLength(0);
  });

  it('getReport returns a formatted report', () => {
    const collector = createErrorCollector();
    collector.add('DB_URL', 'Required but missing');
    const report = collector.getReport();
    expect(report.errors).toHaveLength(1);
    expect(report.summary).toContain('DB_URL');
  });

  it('accumulates multiple errors', () => {
    const collector = createErrorCollector();
    collector.add('A', 'err A');
    collector.add('B', 'err B');
    collector.add('C', 'err C');
    expect(collector.getErrors()).toHaveLength(3);
  });
});

describe('throwIfErrors', () => {
  it('does not throw when there are no errors', () => {
    const collector = createErrorCollector();
    expect(() => throwIfErrors(collector)).not.toThrow();
  });

  it('throws with formatted message when there are errors', () => {
    const collector = createErrorCollector();
    collector.add('SECRET', 'Required but missing');
    expect(() => throwIfErrors(collector)).toThrow(/SECRET/);
    expect(() => throwIfErrors(collector)).toThrow(/1 error/);
  });

  it('includes all errors in the thrown message', () => {
    const collector = createErrorCollector();
    collector.add('A', 'missing');
    collector.add('B', 'invalid');
    expect(() => throwIfErrors(collector)).toThrow(/2 error/);
  });
});
