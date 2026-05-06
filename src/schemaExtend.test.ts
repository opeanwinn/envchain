import { extendSchema, pickSchema, omitSchema, mergeSchemaResults } from './schemaExtend';
import { buildFieldPipeline } from './fieldPipeline';
import { parseString, parseNumber } from './parser';
import { makeRequired } from './required';
import { makeOptional } from './optional';
import { defineSchema } from './schema';

const baseShape = {
  HOST: buildFieldPipeline<string>(parseString, [makeRequired]),
  PORT: buildFieldPipeline<number>(parseNumber, [makeRequired]),
};

const extShape = {
  API_KEY: buildFieldPipeline<string>(parseString, [makeRequired]),
};

describe('extendSchema', () => {
  it('merges base and extension shapes', () => {
    const merged = extendSchema(baseShape, extShape);
    expect(Object.keys(merged)).toEqual(expect.arrayContaining(['HOST', 'PORT', 'API_KEY']));
  });

  it('extension overrides base keys', () => {
    const override = { HOST: buildFieldPipeline<string>(parseString, [makeOptional]) };
    const merged = extendSchema(baseShape, override);
    expect(merged.HOST).toBe(override.HOST);
  });
});

describe('pickSchema', () => {
  it('returns only picked keys', () => {
    const picked = pickSchema(baseShape, ['HOST']);
    expect(Object.keys(picked)).toEqual(['HOST']);
    expect(picked).not.toHaveProperty('PORT');
  });
});

describe('omitSchema', () => {
  it('returns shape without omitted keys', () => {
    const omitted = omitSchema(baseShape, ['PORT']);
    expect(Object.keys(omitted)).toEqual(['HOST']);
    expect(omitted).not.toHaveProperty('PORT');
  });
});

describe('mergeSchemaResults', () => {
  it('merges two successful results', () => {
    const a = defineSchema(baseShape)({ HOST: 'localhost', PORT: '3000' });
    const b = defineSchema(extShape)({ API_KEY: 'secret' });
    const merged = mergeSchemaResults(a, b);
    expect(merged.success).toBe(true);
    expect(merged.data?.HOST).toBe('localhost');
    expect(merged.data?.API_KEY).toBe('secret');
  });

  it('collects errors from both results', () => {
    const a = defineSchema(baseShape)({});
    const b = defineSchema(extShape)({});
    const merged = mergeSchemaResults(a, b);
    expect(merged.success).toBe(false);
    expect(merged.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('fails if only one result has errors', () => {
    const a = defineSchema(baseShape)({ HOST: 'localhost', PORT: '3000' });
    const b = defineSchema(extShape)({});
    const merged = mergeSchemaResults(a, b);
    expect(merged.success).toBe(false);
  });
});
