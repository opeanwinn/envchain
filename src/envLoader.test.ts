import { loadEnv, createEnvLoader, pickSchemaKeys } from './envLoader';

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('loadEnv', () => {
  it('merges process.env with additional sources', () => {
    process.env.BASE_KEY = 'base';
    const result = loadEnv({ sources: [{ EXTRA_KEY: 'extra' }], interpolate: false });
    expect(result['BASE_KEY']).toBe('base');
    expect(result['EXTRA_KEY']).toBe('extra');
  });

  it('later sources override earlier ones', () => {
    const result = loadEnv({
      overrideProcessEnv: true,
      sources: [{ KEY: 'first' }, { KEY: 'second' }],
      interpolate: false,
    });
    expect(result['KEY']).toBe('second');
  });

  it('overrideProcessEnv ignores process.env', () => {
    process.env.SHOULD_NOT_APPEAR = 'yes';
    const result = loadEnv({ overrideProcessEnv: true, sources: [], interpolate: false });
    expect(result['SHOULD_NOT_APPEAR']).toBeUndefined();
  });

  it('performs interpolation when interpolate is true', () => {
    const result = loadEnv({
      overrideProcessEnv: true,
      sources: [{ HOST: 'localhost', URL: 'http://${HOST}:8080' }],
      interpolate: true,
    });
    expect(result['URL']).toBe('http://localhost:8080');
  });

  it('throws in strict mode when a value is empty', () => {
    expect(() =>
      loadEnv({
        overrideProcessEnv: true,
        sources: [{ KEY: '' }],
        strict: true,
        interpolate: false,
      })
    ).toThrow(/KEY/);
  });

  it('returns merged env without throwing when strict is false', () => {
    expect(() =>
      loadEnv({
        overrideProcessEnv: true,
        sources: [{ KEY: '' }],
        strict: false,
        interpolate: false,
      })
    ).not.toThrow();
  });
});

describe('createEnvLoader', () => {
  it('creates a reusable loader with default sources', () => {
    const load = createEnvLoader([{ APP: 'myapp' }], { overrideProcessEnv: true, interpolate: false });
    const result = load();
    expect(result['APP']).toBe('myapp');
  });

  it('allows extra sources to be passed at call time', () => {
    const load = createEnvLoader([{ A: '1' }], { overrideProcessEnv: true, interpolate: false });
    const result = load([{ B: '2' }]);
    expect(result['A']).toBe('1');
    expect(result['B']).toBe('2');
  });
});

describe('pickSchemaKeys', () => {
  it('returns only keys declared in the schema', () => {
    const schema = { PORT: {}, HOST: {} } as any;
    const source = { PORT: '3000', HOST: 'localhost', EXTRA: 'ignored' };
    const result = pickSchemaKeys(schema, source);
    expect(result).toEqual({ PORT: '3000', HOST: 'localhost' });
    expect(result['EXTRA']).toBeUndefined();
  });

  it('omits schema keys not present in source', () => {
    const schema = { PORT: {}, HOST: {} } as any;
    const source = { PORT: '3000' };
    const result = pickSchemaKeys(schema, source);
    expect(Object.keys(result)).toEqual(['PORT']);
  });
});
