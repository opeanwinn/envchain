import {
  toScreamingSnakeKey,
  trimValue,
  lowercaseValue,
  normalizeKeys,
  normalizeValues,
  normalizeEnv,
} from './envNormalize';
import {
  createKeyNormalizeMiddleware,
  createValueNormalizeMiddleware,
  createNormalizeMiddleware,
  defaultNormalizeMiddleware,
  composeNormalizeMiddlewares,
} from './envNormalizeMiddleware';

describe('toScreamingSnakeKey', () => {
  it('converts camelCase to SCREAMING_SNAKE', () => {
    expect(toScreamingSnakeKey('myApiKey')).toBe('MY_API_KEY');
  });

  it('converts kebab-case to SCREAMING_SNAKE', () => {
    expect(toScreamingSnakeKey('my-api-key')).toBe('MY_API_KEY');
  });

  it('converts dot.notation to SCREAMING_SNAKE', () => {
    expect(toScreamingSnakeKey('my.api.key')).toBe('MY_API_KEY');
  });

  it('leaves already screaming snake unchanged', () => {
    expect(toScreamingSnakeKey('MY_API_KEY')).toBe('MY_API_KEY');
  });
});

describe('trimValue', () => {
  it('trims leading and trailing whitespace', () => {
    expect(trimValue('  hello  ')).toBe('hello');
  });

  it('returns unchanged if no whitespace', () => {
    expect(trimValue('hello')).toBe('hello');
  });
});

describe('lowercaseValue', () => {
  it('lowercases a value', () => {
    expect(lowercaseValue('HELLO')).toBe('hello');
  });
});

describe('normalizeKeys', () => {
  it('applies fn to all keys', () => {
    const env = { myKey: 'val1', anotherKey: 'val2' };
    const result = normalizeKeys(env, toScreamingSnakeKey);
    expect(result).toEqual({ MY_KEY: 'val1', ANOTHER_KEY: 'val2' });
  });
});

describe('normalizeValues', () => {
  it('applies fn to all values', () => {
    const env = { KEY: '  value  ' };
    const result = normalizeValues(env, trimValue);
    expect(result).toEqual({ KEY: 'value' });
  });
});

describe('normalizeEnv', () => {
  it('applies both key and value normalization', () => {
    const env = { myKey: '  hello  ' };
    const result = normalizeEnv(env, { keys: toScreamingSnakeKey, values: trimValue });
    expect(result).toEqual({ MY_KEY: 'hello' });
  });

  it('returns copy without mutation when no options', () => {
    const env = { KEY: 'value' };
    const result = normalizeEnv(env);
    expect(result).toEqual(env);
    expect(result).not.toBe(env);
  });
});

describe('createKeyNormalizeMiddleware', () => {
  it('normalizes keys via middleware', () => {
    const mw = createKeyNormalizeMiddleware(toScreamingSnakeKey);
    expect(mw({ fooBar: 'baz' })).toEqual({ FOO_BAR: 'baz' });
  });
});

describe('createValueNormalizeMiddleware', () => {
  it('normalizes values via middleware', () => {
    const mw = createValueNormalizeMiddleware(trimValue);
    expect(mw({ KEY: '  val  ' })).toEqual({ KEY: 'val' });
  });
});

describe('defaultNormalizeMiddleware', () => {
  it('applies screaming snake keys and trimmed values', () => {
    const result = defaultNormalizeMiddleware({ myToken: '  secret  ' });
    expect(result).toEqual({ MY_TOKEN: 'secret' });
  });
});

describe('composeNormalizeMiddlewares', () => {
  it('composes multiple middlewares in order', () => {
    const mw1 = createKeyNormalizeMiddleware(toScreamingSnakeKey);
    const mw2 = createValueNormalizeMiddleware(trimValue);
    const composed = composeNormalizeMiddlewares(mw1, mw2);
    expect(composed({ myKey: '  hello  ' })).toEqual({ MY_KEY: 'hello' });
  });
});
