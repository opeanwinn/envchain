import {
  composeMiddleware,
  applyMiddlewareChain,
  trimMiddleware,
  maskMiddleware,
} from './middleware';
import { EnvSchema } from './envchain';

const mockSchema = {} as EnvSchema<Record<string, unknown>>;

describe('composeMiddleware', () => {
  it('passes value through a single middleware', () => {
    const mw = composeMiddleware<Record<string, unknown>>(
      (_k, v) => (v ? v.toUpperCase() : v)
    );
    expect(mw('KEY', 'hello', mockSchema)).toBe('HELLO');
  });

  it('chains multiple middlewares in order', () => {
    const trim = (_k: string, v: string | undefined) =>
      typeof v === 'string' ? v.trim() : v;
    const upper = (_k: string, v: string | undefined) =>
      typeof v === 'string' ? v.toUpperCase() : v;
    const mw = composeMiddleware<Record<string, unknown>>(trim, upper);
    expect(mw('KEY', '  hello  ', mockSchema)).toBe('HELLO');
  });

  it('handles undefined values gracefully', () => {
    const mw = composeMiddleware<Record<string, unknown>>(
      (_k, v) => v
    );
    expect(mw('KEY', undefined, mockSchema)).toBeUndefined();
  });
});

describe('applyMiddlewareChain', () => {
  it('returns original env when chain is empty', () => {
    const env = { FOO: 'bar', BAZ: 'qux' };
    expect(applyMiddlewareChain(env, mockSchema, [])).toEqual(env);
  });

  it('applies middleware to all keys', () => {
    const env = { FOO: '  hello  ', BAR: '  world  ' };
    const result = applyMiddlewareChain(env, mockSchema, [
      trimMiddleware(),
    ]);
    expect(result).toEqual({ FOO: 'hello', BAR: 'world' });
  });
});

describe('trimMiddleware', () => {
  it('trims whitespace from values', () => {
    const mw = trimMiddleware<Record<string, unknown>>();
    expect(mw('KEY', '  value  ', mockSchema)).toBe('value');
  });

  it('leaves undefined unchanged', () => {
    const mw = trimMiddleware<Record<string, unknown>>();
    expect(mw('KEY', undefined, mockSchema)).toBeUndefined();
  });
});

describe('maskMiddleware', () => {
  it('masks sensitive keys', () => {
    const mw = maskMiddleware<Record<string, unknown>>(['SECRET']);
    expect(mw('SECRET', 'my-secret-value', mockSchema)).toBe('***');
  });

  it('does not mask non-sensitive keys', () => {
    const mw = maskMiddleware<Record<string, unknown>>(['SECRET']);
    expect(mw('PUBLIC', 'visible', mockSchema)).toBe('visible');
  });

  it('leaves undefined unchanged for non-sensitive keys', () => {
    const mw = maskMiddleware<Record<string, unknown>>(['SECRET']);
    expect(mw('PUBLIC', undefined, mockSchema)).toBeUndefined();
  });
});
