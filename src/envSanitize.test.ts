import { sanitizeValue, sanitizeEnv, sanitizeEnvByKeys, isSafeValue } from './envSanitize';

describe('sanitizeValue', () => {
  it('trims whitespace by default', () => {
    expect(sanitizeValue('  hello  ')).toBe('hello');
  });

  it('strips null bytes by default', () => {
    expect(sanitizeValue('hello\0world')).toBe('helloworld');
  });

  it('strips control characters by default', () => {
    expect(sanitizeValue('hello\x01\x1Fworld')).toBe('helloworld');
  });

  it('preserves tab, newline, carriage return', () => {
    const value = 'a\tb\nc\r';
    expect(sanitizeValue(value)).toBe('a\tb\nc\r'.trim());
  });

  it('respects maxLength option', () => {
    expect(sanitizeValue('hello world', { maxLength: 5 })).toBe('hello');
  });

  it('returns empty string when allowedPattern does not match', () => {
    expect(sanitizeValue('abc123', { allowedPattern: /^[0-9]+$/ })).toBe('');
  });

  it('returns value when allowedPattern matches', () => {
    expect(sanitizeValue('12345', { allowedPattern: /^[0-9]+$/ })).toBe('12345');
  });

  it('does not trim when trim is false', () => {
    expect(sanitizeValue('  hello  ', { trim: false })).toBe('  hello  ');
  });

  it('does not strip control chars when disabled', () => {
    const value = 'a\x01b';
    expect(sanitizeValue(value, { stripControlChars: false, trim: false })).toBe('a\x01b');
  });

  it('handles empty string', () => {
    expect(sanitizeValue('')).toBe('');
  });
});

describe('sanitizeEnv', () => {
  it('sanitizes all values in the env record', () => {
    const env = { FOO: '  bar  ', BAZ: 'hello\0world' };
    expect(sanitizeEnv(env)).toEqual({ FOO: 'bar', BAZ: 'helloworld' });
  });

  it('returns empty object for empty input', () => {
    expect(sanitizeEnv({})).toEqual({});
  });

  it('applies options to all values', () => {
    const env = { A: 'hello world', B: 'foobar' };
    expect(sanitizeEnv(env, { maxLength: 5 })).toEqual({ A: 'hello', B: 'fooba' });
  });
});

describe('sanitizeEnvByKeys', () => {
  it('only sanitizes specified keys', () => {
    const env = { FOO: '  bar  ', BAZ: '  qux  ' };
    const result = sanitizeEnvByKeys(env, ['FOO']);
    expect(result.FOO).toBe('bar');
    expect(result.BAZ).toBe('  qux  ');
  });

  it('leaves unspecified keys unchanged', () => {
    const env = { A: 'hello\0', B: 'world\0' };
    const result = sanitizeEnvByKeys(env, ['A']);
    expect(result.A).toBe('hello');
    expect(result.B).toBe('world\0');
  });
});

describe('isSafeValue', () => {
  it('returns true for a clean string', () => {
    expect(isSafeValue('hello world')).toBe(true);
  });

  it('returns false when null byte is present', () => {
    expect(isSafeValue('hello\0')).toBe(false);
  });

  it('returns false when control character is present', () => {
    expect(isSafeValue('hello\x01')).toBe(false);
  });

  it('returns false when allowedPattern does not match', () => {
    expect(isSafeValue('abc', /^[0-9]+$/)).toBe(false);
  });

  it('returns true when allowedPattern matches', () => {
    expect(isSafeValue('123', /^[0-9]+$/)).toBe(true);
  });
});
