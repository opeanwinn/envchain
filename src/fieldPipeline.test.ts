import { describe, it, expect } from 'vitest';
import { resolveFieldPipeline, buildFieldPipeline } from './fieldPipeline';
import { createPipeline } from './pipeline';

describe('resolveFieldPipeline', () => {
  const numPipeline = createPipeline((v: string) => {
    const n = Number(v);
    if (isNaN(n)) throw new Error(`"${v}" is not a valid number`);
    return n;
  });

  it('resolves a valid raw value through the pipeline', () => {
    const result = resolveFieldPipeline('42', {
      name: 'PORT',
      pipeline: numPipeline,
    });
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it('returns error for missing value without fallback', () => {
    const result = resolveFieldPipeline(undefined, {
      name: 'PORT',
      pipeline: numPipeline,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Missing required environment variable');
      expect(result.error).toContain('PORT');
    }
  });

  it('returns error for empty string without fallback', () => {
    const result = resolveFieldPipeline('', {
      name: 'PORT',
      pipeline: numPipeline,
    });
    expect(result.ok).toBe(false);
  });

  it('uses fallback when value is undefined', () => {
    const result = resolveFieldPipeline(undefined, {
      name: 'PORT',
      pipeline: numPipeline,
      fallback: 3000,
    });
    expect(result).toEqual({ ok: true, value: 3000 });
  });

  it('returns error when pipeline throws', () => {
    const result = resolveFieldPipeline('not-a-number', {
      name: 'PORT',
      pipeline: numPipeline,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Failed to process');
      expect(result.error).toContain('PORT');
    }
  });
});

describe('buildFieldPipeline', () => {
  it('builds a pipeline from a single step', () => {
    const p = buildFieldPipeline((v: string) => v.trim());
    expect(p.run('  hello  ')).toBe('hello');
  });

  it('builds a pipeline from multiple steps', () => {
    const p = buildFieldPipeline(
      (v: string) => parseInt(v, 10),
      (n: number) => n + 1,
      (n: number) => n * 2
    );
    // (5 + 1) * 2 = 12
    expect(p.run('5')).toBe(12);
  });
});
