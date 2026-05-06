import { defineSchema, parseSchema } from './schema';
import { buildFieldPipeline } from './fieldPipeline';
import { parseString, parseNumber, parseBoolean } from './parser';
import { makeRequired } from './required';
import { makeOptional } from './optional';

describe('defineSchema', () => {
  const shape = {
    HOST: buildFieldPipeline<string>(parseString, [makeRequired]),
    PORT: buildFieldPipeline<number>(parseNumber, [makeRequired]),
    DEBUG: buildFieldPipeline<boolean | undefined>(parseBoolean, [makeOptional]),
  };

  it('returns success with valid env', () => {
    const result = defineSchema(shape)({ HOST: 'localhost', PORT: '3000', DEBUG: 'true' });
    expect(result.success).toBe(true);
    expect(result.data?.HOST).toBe('localhost');
    expect(result.data?.PORT).toBe(3000);
    expect(result.data?.DEBUG).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for missing required fields', () => {
    const result = defineSchema(shape)({ HOST: undefined, PORT: undefined });
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns undefined for optional missing field', () => {
    const result = defineSchema(shape)({ HOST: 'localhost', PORT: '8080' });
    expect(result.success).toBe(true);
    expect(result.data?.DEBUG).toBeUndefined();
  });

  it('collects multiple errors', () => {
    const result = defineSchema(shape)({});
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('returns error if env is not an object', () => {
    const result = defineSchema(shape)(null as any);
    expect(result.success).toBe(false);
    expect(result.errors[0]).toMatch(/object/);
  });
});

describe('parseSchema', () => {
  const shape = {
    API_URL: buildFieldPipeline<string>(parseString, [makeRequired]),
  };

  it('returns parsed data on success', () => {
    const data = parseSchema(shape, { API_URL: 'https://example.com' });
    expect(data.API_URL).toBe('https://example.com');
  });

  it('throws on validation failure', () => {
    expect(() => parseSchema(shape, {})).toThrow();
  });
});
