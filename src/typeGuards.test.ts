import {
  isObject,
  isNonEmptyString,
  isFiniteNumber,
  isSafeInteger,
  isBoolean,
  isNullish,
  isNumericString,
  isBooleanString,
  isOneOf,
  isArrayOf,
} from './typeGuards';

describe('isObject', () => {
  it('returns true for plain objects', () => expect(isObject({ a: 1 })).toBe(true));
  it('returns false for arrays', () => expect(isObject([])).toBe(false));
  it('returns false for null', () => expect(isObject(null)).toBe(false));
  it('returns false for primitives', () => expect(isObject('hello')).toBe(false));
});

describe('isNonEmptyString', () => {
  it('returns true for non-empty strings', () => expect(isNonEmptyString('hello')).toBe(true));
  it('returns false for empty string', () => expect(isNonEmptyString('')).toBe(false));
  it('returns false for whitespace-only string', () => expect(isNonEmptyString('   ')).toBe(false));
  it('returns false for numbers', () => expect(isNonEmptyString(42)).toBe(false));
});

describe('isFiniteNumber', () => {
  it('returns true for finite numbers', () => expect(isFiniteNumber(3.14)).toBe(true));
  it('returns false for Infinity', () => expect(isFiniteNumber(Infinity)).toBe(false));
  it('returns false for NaN', () => expect(isFiniteNumber(NaN)).toBe(false));
  it('returns false for strings', () => expect(isFiniteNumber('42')).toBe(false));
});

describe('isSafeInteger', () => {
  it('returns true for safe integers', () => expect(isSafeInteger(100)).toBe(true));
  it('returns false for floats', () => expect(isSafeInteger(3.14)).toBe(false));
  it('returns false for Number.MAX_SAFE_INTEGER + 1', () =>
    expect(isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false));
});

describe('isBoolean', () => {
  it('returns true for true', () => expect(isBoolean(true)).toBe(true));
  it('returns true for false', () => expect(isBoolean(false)).toBe(true));
  it('returns false for strings', () => expect(isBoolean('true')).toBe(false));
});

describe('isNullish', () => {
  it('returns true for null', () => expect(isNullish(null)).toBe(true));
  it('returns true for undefined', () => expect(isNullish(undefined)).toBe(true));
  it('returns false for 0', () => expect(isNullish(0)).toBe(false));
  it('returns false for empty string', () => expect(isNullish('')).toBe(false));
});

describe('isNumericString', () => {
  it('returns true for "42"', () => expect(isNumericString('42')).toBe(true));
  it('returns true for "3.14"', () => expect(isNumericString('3.14')).toBe(true));
  it('returns false for "abc"', () => expect(isNumericString('abc')).toBe(false));
  it('returns false for empty string', () => expect(isNumericString('')).toBe(false));
});

describe('isBooleanString', () => {
  it('returns true for "true"', () => expect(isBooleanString('true')).toBe(true));
  it('returns true for "false"', () => expect(isBooleanString('false')).toBe(true));
  it('returns true for "1" and "0"', () => {
    expect(isBooleanString('1')).toBe(true);
    expect(isBooleanString('0')).toBe(true);
  });
  it('returns false for "yes"', () => expect(isBooleanString('yes')).toBe(false));
});

describe('isOneOf', () => {
  const allowed = ['debug', 'info', 'warn', 'error'] as const;
  it('returns true for allowed values', () => expect(isOneOf('info', allowed)).toBe(true));
  it('returns false for disallowed values', () => expect(isOneOf('verbose', allowed)).toBe(false));
});

describe('isArrayOf', () => {
  it('returns true for array of strings', () =>
    expect(isArrayOf(['a', 'b'], (v): v is string => typeof v === 'string')).toBe(true));
  it('returns false if any element fails guard', () =>
    expect(isArrayOf(['a', 1], (v): v is string => typeof v === 'string')).toBe(false));
  it('returns false for non-arrays', () =>
    expect(isArrayOf('hello', (v): v is string => typeof v === 'string')).toBe(false));
});
