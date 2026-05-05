import { describe, it, expect } from 'vitest';
import { Field, field } from './field';
import { validators, ValidationError } from './validators';

describe('Field', () => {
  it('parses a valid value using the provided validator', () => {
    const f = field(validators.number());
    expect(f.parse('PORT', '3000')).toBe(3000);
  });

  it('throws ValidationError when required and value is missing', () => {
    const f = field(validators.string());
    expect(() => f.parse('SECRET', undefined)).toThrowError(ValidationError);
    expect(() => f.parse('SECRET', undefined)).toThrowError('SECRET');
  });

  it('returns undefined when optional and value is missing', () => {
    const f = field(validators.string()).optional();
    expect(f.parse('OPTIONAL_KEY', undefined)).toBeUndefined();
  });

  it('uses default value when raw value is not set', () => {
    const f = field(validators.integer()).default('8080');
    expect(f.parse('PORT', undefined)).toBe(8080);
  });

  it('prefers raw value over default value', () => {
    const f = field(validators.integer()).default('8080');
    expect(f.parse('PORT', '9090')).toBe(9090);
  });

  it('sets description via describe()', () => {
    const f = field(validators.string()).describe('API base URL');
    expect(f.description).toBe('API base URL');
  });

  it('marks field as not required after calling default()', () => {
    const f = field(validators.string()).default('fallback');
    expect(f.isRequired).toBe(false);
  });

  it('throws ValidationError wrapping validator errors', () => {
    const f = field(validators.url());
    expect(() => f.parse('API_URL', 'not-a-url')).toThrowError(ValidationError);
  });

  it('treats empty string as missing value', () => {
    const f = field(validators.string()).optional();
    expect(f.parse('KEY', '')).toBeUndefined();
  });
});
