import { describe, it, expect } from 'vitest';
import {
  diffEnvMaps,
  hasDiff,
  filterDiff,
  formatDiffReport,
} from './envDiff';

describe('diffEnvMaps', () => {
  it('detects added keys', () => {
    const report = diffEnvMaps({}, { NEW_KEY: 'value' });
    expect(report.added).toHaveLength(1);
    expect(report.added[0]).toMatchObject({ key: 'NEW_KEY', kind: 'added', newValue: 'value' });
  });

  it('detects removed keys', () => {
    const report = diffEnvMaps({ OLD_KEY: 'old' }, {});
    expect(report.removed).toHaveLength(1);
    expect(report.removed[0]).toMatchObject({ key: 'OLD_KEY', kind: 'removed', oldValue: 'old' });
  });

  it('detects changed keys', () => {
    const report = diffEnvMaps({ KEY: 'before' }, { KEY: 'after' });
    expect(report.changed).toHaveLength(1);
    expect(report.changed[0]).toMatchObject({ key: 'KEY', kind: 'changed', oldValue: 'before', newValue: 'after' });
  });

  it('detects unchanged keys', () => {
    const report = diffEnvMaps({ KEY: 'same' }, { KEY: 'same' });
    expect(report.unchanged).toHaveLength(1);
    expect(report.unchanged[0].kind).toBe('unchanged');
  });

  it('populates all entries', () => {
    const report = diffEnvMaps({ A: '1', B: '2' }, { B: '99', C: '3' });
    expect(report.all).toHaveLength(3);
  });

  it('returns empty report for identical maps', () => {
    const env = { PORT: '3000', HOST: 'localhost' };
    const report = diffEnvMaps(env, { ...env });
    expect(report.added).toHaveLength(0);
    expect(report.removed).toHaveLength(0);
    expect(report.changed).toHaveLength(0);
  });
});

describe('hasDiff', () => {
  it('returns true when there are differences', () => {
    const report = diffEnvMaps({ A: '1' }, { A: '2' });
    expect(hasDiff(report)).toBe(true);
  });

  it('returns false when maps are identical', () => {
    const report = diffEnvMaps({ A: '1' }, { A: '1' });
    expect(hasDiff(report)).toBe(false);
  });
});

describe('filterDiff', () => {
  it('filters entries by kind', () => {
    const report = diffEnvMaps({ A: '1' }, { A: '2', B: '3' });
    expect(filterDiff(report, 'added')).toHaveLength(1);
    expect(filterDiff(report, 'changed')).toHaveLength(1);
    expect(filterDiff(report, 'removed')).toHaveLength(0);
  });
});

describe('formatDiffReport', () => {
  it('formats a human-readable diff', () => {
    const report = diffEnvMaps({ OLD: 'x', SHARED: 'before' }, { NEW: 'y', SHARED: 'after' });
    const output = formatDiffReport(report);
    expect(output).toContain('+ NEW=y');
    expect(output).toContain('- OLD=x');
    expect(output).toContain('~ SHARED: before → after');
  });

  it('returns empty string for identical maps', () => {
    const report = diffEnvMaps({ A: '1' }, { A: '1' });
    expect(formatDiffReport(report)).toBe('');
  });
});
