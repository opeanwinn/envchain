import { describe, it, expect } from 'vitest';
import { resolveDefault, withDefault, withDefaultParser } from './defaults';

describe('resolveDefault', () => {
  it('returns static value directly', () => {
    expect(resolveDefault(42)).toBe(42);
    expect(resolveDefault('hello')).toBe('hello');
    expect(resolveDefault(false)).toBe(false);
  });

  it('calls factory function and returns result', () => {
    expect(resolveDefault(() => 99)).toBe(99);
    expect(resolveDefault(() => 'dynamic')).toBe('dynamic');
  });
});

describe('withDefault', () => {
  it('returns value when defined and non-empty', () => {
    expect(withDefault('hello', 'default')).toBe('hello');
    expect(withDefault(0, 42)).toBe(0);
    expect(withDefault(false, true)).toBe(false);
  });

  it('returns default when value is undefined', () => {
    expect(withDefault(undefined, 'fallback')).toBe('fallback');
  });

  it('returns default when value is null', () => {
    expect(withDefault(null, 'fallback')).toBe('fallback');
  });

  it('returns default when string value is empty or whitespace', () => {
    expect(withDefault('', 'fallback')).toBe('fallback');
    expect(withDefault('   ', 'fallback')).toBe('fallback');
  });

  it('supports factory function as default', () => {
    expect(withDefault(undefined, () => 'generated')).toBe('generated');
  });
});

describe('withDefaultParser', () => {
  const parseNum = (raw: string) => parseInt(raw, 10);

  it('parses value when raw string is present', () => {
    const parser = withDefaultParser(parseNum, 0);
    expect(parser('42')).toBe(42);
  });

  it('returns default when raw is undefined', () => {
    const parser = withDefaultParser(parseNum, 99);
    expect(parser(undefined)).toBe(99);
  });

  it('returns default when raw is empty string', () => {
    const parser = withDefaultParser(parseNum, 7);
    expect(parser('')).toBe(7);
    expect(parser('   ')).toBe(7);
  });

  it('supports factory default', () => {
    const parser = withDefaultParser(parseNum, () => 100);
    expect(parser(undefined)).toBe(100);
  });
});
