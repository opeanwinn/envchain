import { describe, it, expect } from 'vitest';
import {
  maskValue,
  maskEnv,
  maskEnvByPattern,
} from './envMask';
import {
  createMaskMiddleware,
  createDefaultSecretMaskMiddleware,
} from './envMaskMiddleware';

describe('maskValue', () => {
  it('masks entire value by default', () => {
    expect(maskValue('supersecret')).toBe('***********');
  });

  it('reveals prefix characters', () => {
    expect(maskValue('supersecret', { visibleStart: 3 })).toBe('sup********');
  });

  it('reveals suffix characters', () => {
    expect(maskValue('supersecret', { visibleEnd: 2 })).toBe('*********et');
  });

  it('reveals both prefix and suffix', () => {
    expect(maskValue('supersecret', { visibleStart: 2, visibleEnd: 2 })).toBe('su*******et');
  });

  it('uses a custom mask character', () => {
    expect(maskValue('hello', { maskChar: '#' })).toBe('#####');
  });

  it('handles empty string', () => {
    expect(maskValue('')).toBe('');
  });

  it('handles visibleStart larger than value length', () => {
    expect(maskValue('hi', { visibleStart: 10 })).toBe('hi');
  });
});

describe('maskEnv', () => {
  it('masks only specified keys', () => {
    const env = { API_KEY: 'abc123', PORT: '3000' };
    const result = maskEnv(env, ['API_KEY']);
    expect(result.API_KEY).toBe('******');
    expect(result.PORT).toBe('3000');
  });

  it('does not mutate original env', () => {
    const env = { SECRET: 'value' };
    maskEnv(env, ['SECRET']);
    expect(env.SECRET).toBe('value');
  });
});

describe('maskEnvByPattern', () => {
  it('masks keys matching pattern', () => {
    const env = { DB_PASSWORD: 'pass', DB_HOST: 'localhost' };
    const result = maskEnvByPattern(env, /_PASSWORD$/i);
    expect(result.DB_PASSWORD).toBe('****');
    expect(result.DB_HOST).toBe('localhost');
  });
});

describe('createMaskMiddleware', () => {
  it('masks by keys and pattern together', () => {
    const env = { MY_SECRET: 'abc', MY_TOKEN: 'xyz', PORT: '8080' };
    const middleware = createMaskMiddleware({
      keys: ['MY_SECRET'],
      pattern: /_TOKEN$/,
      visibleStart: 1,
    });
    const result = middleware(env);
    expect(result.MY_SECRET).toBe('a**');
    expect(result.MY_TOKEN).toBe('x**');
    expect(result.PORT).toBe('8080');
  });
});

describe('createDefaultSecretMaskMiddleware', () => {
  it('masks common secret key patterns', () => {
    const env = {
      DB_PASSWORD: 'hunter2',
      API_TOKEN: 'tok_abc',
      APP_SECRET: 'shh',
      NODE_ENV: 'production',
    };
    const middleware = createDefaultSecretMaskMiddleware();
    const result = middleware(env);
    expect(result.DB_PASSWORD).toBe('*******');
    expect(result.API_TOKEN).toBe('*******');
    expect(result.APP_SECRET).toBe('***');
    expect(result.NODE_ENV).toBe('production');
  });
});
