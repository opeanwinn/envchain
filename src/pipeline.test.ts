import { describe, it, expect } from 'vitest';
import {
  createPipeline,
  composePipeline,
  runSafe,
} from './pipeline';

describe('createPipeline', () => {
  it('runs a single-step pipeline', () => {
    const p = createPipeline((v: string) => v.trim());
    expect(p.run('  hello  ')).toBe('hello');
  });

  it('chains multiple steps via .pipe()', () => {
    const p = createPipeline((v: string) => v.trim())
      .pipe((v) => v.toLowerCase())
      .pipe((v) => v.replace(/-/g, '_'));

    expect(p.run('  Hello-World  ')).toBe('hello_world');
  });

  it('supports type transformations across steps', () => {
    const p = createPipeline((v: string) => parseInt(v, 10))
      .pipe((n) => n * 2)
      .pipe((n) => `result: ${n}`);

    expect(p.run('21')).toBe('result: 42');
  });

  it('passes value through identity pipeline', () => {
    const p = createPipeline((v: number) => v);
    expect(p.run(99)).toBe(99);
  });
});

describe('composePipeline', () => {
  it('composes an array of same-type functions', () => {
    const composed = composePipeline<string>([
      (v) => v.trim(),
      (v) => v.toUpperCase(),
      (v) => v + '!',
    ]);
    expect(composed('  hello  ')).toBe('HELLO!');
  });

  it('returns identity for empty array', () => {
    const composed = composePipeline<number>([]);
    expect(composed(42)).toBe(42);
  });
});

describe('runSafe', () => {
  it('returns ok result on success', () => {
    const p = createPipeline((v: string) => v.toUpperCase());
    const result = runSafe(p, 'hello');
    expect(result).toEqual({ ok: true, value: 'HELLO' });
  });

  it('returns error result when pipeline throws', () => {
    const p = createPipeline((_v: string): string => {
      throw new Error('pipeline failure');
    });
    const result = runSafe(p, 'test');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('pipeline failure');
    }
  });

  it('wraps non-Error throws in an Error', () => {
    const p = createPipeline((_v: string): string => {
      throw 'raw string error';
    });
    const result = runSafe(p, 'test');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe('raw string error');
    }
  });
});
