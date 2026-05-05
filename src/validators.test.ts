import { describe, it, expect } from 'vitest';
import { validators, ValidationError } from './validators';

describe('validators', () => {
  describe('string', () => {
    it('returns the value as-is', () => {
      expect(validators.string()('hello')).toBe('hello');
    });
  });

  describe('number', () => {
    it('parses valid numbers', () => {
      expect(validators.number()('3.14')).toBe(3.14);
      expect(validators.number()('42')).toBe(42);
    });

    it('throws on non-numeric input', () => {
      expect(() => validators.number()('abc')).toThrow();
    });
  });

  describe('integer', () => {
    it('parses valid integers', () => {
      expect(validators.integer()('10')).toBe(10);
    });

    it('throws on floats', () => {
      expect(() => validators.integer()('3.14')).toThrow();
    });

    it('throws on non-numeric input', () => {
      expect(() => validators.integer()('abc')).toThrow();
    });
  });

  describe('boolean', () => {
    it('returns true for truthy values', () => {
      expect(validators.boolean()('true')).toBe(true);
      expect(validators.boolean()('1')).toBe(true);
      expect(validators.boolean()('yes')).toBe(true);
    });

    it('returns false for falsy values', () => {
      expect(validators.boolean()('false')).toBe(false);
      expect(validators.boolean()('0')).toBe(false);
      expect(validators.boolean()('no')).toBe(false);
    });

    it('throws on invalid values', () => {
      expect(() => validators.boolean()('maybe')).toThrow();
    });
  });

  describe('url', () => {
    it('accepts valid URLs', () => {
      expect(validators.url()('https://example.com')).toBe('https://example.com');
    });

    it('throws on invalid URLs', () => {
      expect(() => validators.url()('not-a-url')).toThrow();
    });
  });

  describe('enum', () => {
    it('accepts allowed values', () => {
      expect(validators.enum(['a', 'b', 'c'])('b')).toBe('b');
    });

    it('throws on disallowed values', () => {
      expect(() => validators.enum(['a', 'b'])('c')).toThrow();
    });
  });

  describe('port', () => {
    it('accepts valid ports', () => {
      expect(validators.port()('3000')).toBe(3000);
      expect(validators.port()('65535')).toBe(65535);
    });

    it('throws on out-of-range ports', () => {
      expect(() => validators.port()('0')).toThrow();
      expect(() => validators.port()('65536')).toThrow();
    });
  });
});
