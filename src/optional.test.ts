import { describe, it, expect, vi } from 'vitest';
import { makeOptional, isPresent, optionalWithFallback } from './optional';

describe('makeOptional', () => {
  const parseNum = (raw: string) => parseInt(raw, 10);

  it('parses value when raw is a valid string', () => {
    const parser = makeOptional(parseNum);
    expect(parser('42')).toBe(42);
  });

  it('returns undefined when raw is undefined', () => {
    const parser = makeOptional(parseNum);
    expect(parser(undefined)).toBeUndefined();
  });

  it('returns undefined when raw is empty string', () => {
    const parser = makeOptional(parseNum);
    expect(parser('')).toBeUndefined();
    expect(parser('   ')).toBeUndefined();
  });

  it('does not call the inner parser when value is absent', () => {
    const inner = vi.fn((raw: string) => raw.toUpperCase());
    const parser = makeOptional(inner);
    parser(undefined);
    expect(inner).not.toHaveBeenCalled();
  });

  it('calls the inner parser when value is present', () => {
    const inner = vi.fn((raw: string) => raw.toUpperCase());
    const parser = makeOptional(inner);
    parser('hello');
    expect(inner).toHaveBeenCalledWith('hello');
  });
});

describe('isPresent', () => {
  it('returns true for non-empty strings', () => {
    expect(isPresent('hello')).toBe(true);
    expect(isPresent('0')).toBe(true);
  });

  it('returns false for undefined, null, or empty/whitespace', () => {
    expect(isPresent(undefined)).toBe(false);
    expect(isPresent(null)).toBe(false);
    expect(isPresent('')).toBe(false);
    expect(isPresent('   ')).toBe(false);
  });
});

describe('optionalWithFallback', () => {
  const parseStr = (raw: string) => raw.trim().toUpperCase();

  it('parses present values', () => {
    const parser = optionalWithFallback(parseStr);
    expect(parser('hello')).toBe('HELLO');
  });

  it('returns undefined when absent and no fallback given', () => {
    const parser = optionalWithFallback(parseStr);
    expect(parser(undefined)).toBeUndefined();
  });

  it('returns provided fallback when value is absent', () => {
    const parser = optionalWithFallback(parseStr, 'DEFAULT');
    expect(parser('')).toBe('DEFAULT');
    expect(parser(undefined)).toBe('DEFAULT');
  });
});
