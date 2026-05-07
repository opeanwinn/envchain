import {
  transformKeys,
  transformValues,
  toScreamingSnake,
  toCamelCase,
  prefixKeys,
  stripKeyPrefix,
  transformEnv,
} from './envTransform';

describe('transformKeys', () => {
  it('renames all keys using the transformer', () => {
    const env = { foo: 'bar', baz: 'qux' };
    const result = transformKeys(env, (k) => k.toUpperCase());
    expect(result).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('preserves undefined values', () => {
    const env: Record<string, string | undefined> = { key: undefined };
    const result = transformKeys(env, (k) => `PREFIX_${k}`);
    expect(result).toEqual({ PREFIX_key: undefined });
  });
});

describe('transformValues', () => {
  it('transforms all defined values', () => {
    const env = { A: 'hello', B: 'world' };
    const result = transformValues(env, (v) => v.toUpperCase());
    expect(result).toEqual({ A: 'HELLO', B: 'WORLD' });
  });

  it('passes the key to the transformer', () => {
    const env = { HOST: 'localhost' };
    const result = transformValues(env, (v, k) => `${k}=${v}`);
    expect(result).toEqual({ HOST: 'HOST=localhost' });
  });

  it('skips undefined values', () => {
    const env: Record<string, string | undefined> = { A: undefined };
    const result = transformValues(env, (v) => v.toUpperCase());
    expect(result.A).toBeUndefined();
  });
});

describe('toScreamingSnake', () => {
  it('converts camelCase to SCREAMING_SNAKE_CASE', () => {
    expect(toScreamingSnake('myVariableName')).toBe('MY_VARIABLE_NAME');
  });

  it('converts kebab-case to SCREAMING_SNAKE_CASE', () => {
    expect(toScreamingSnake('my-variable-name')).toBe('MY_VARIABLE_NAME');
  });

  it('handles already uppercase input', () => {
    expect(toScreamingSnake('MY_VAR')).toBe('MY_VAR');
  });
});

describe('toCamelCase', () => {
  it('converts SCREAMING_SNAKE_CASE to camelCase', () => {
    expect(toCamelCase('MY_VARIABLE_NAME')).toBe('myVariableName');
  });

  it('converts kebab-case to camelCase', () => {
    expect(toCamelCase('my-variable-name')).toBe('myVariableName');
  });
});

describe('prefixKeys', () => {
  it('adds a prefix to all keys', () => {
    const env = { HOST: 'localhost', PORT: '3000' };
    expect(prefixKeys(env, 'APP_')).toEqual({
      APP_HOST: 'localhost',
      APP_PORT: '3000',
    });
  });
});

describe('stripKeyPrefix', () => {
  it('removes prefix from matching keys', () => {
    const env = { APP_HOST: 'localhost', APP_PORT: '3000', OTHER: 'x' };
    expect(stripKeyPrefix(env, 'APP_')).toEqual({
      HOST: 'localhost',
      PORT: '3000',
    });
  });

  it('drops keys that do not match the prefix', () => {
    const env = { UNRELATED: 'value' };
    expect(stripKeyPrefix(env, 'APP_')).toEqual({});
  });
});

describe('transformEnv', () => {
  it('applies both key and value transformers', () => {
    const env = { db_host: 'localhost' };
    const result = transformEnv(
      env,
      toScreamingSnake,
      (v) => v.trim()
    );
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });
});
