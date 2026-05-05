import { envchain, assertEnv } from './envchain';

describe('envchain', () => {
  it('returns valid data for a complete environment', () => {
    const result = envchain(
      { PORT: { required: true }, HOST: { required: true } },
      { PORT: '3000', HOST: 'localhost' }
    );
    expect(result.isValid).toBe(true);
    expect(result.data.PORT).toBe('3000');
    expect(result.data.HOST).toBe('localhost');
    expect(result.errors).toHaveLength(0);
  });

  it('reports missing required variables', () => {
    const result = envchain(
      { API_KEY: { required: true, description: 'Your API key' } },
      {}
    );
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('API_KEY');
    expect(result.errors[0]).toContain('Your API key');
  });

  it('uses default value when variable is missing', () => {
    const result = envchain(
      { LOG_LEVEL: { default: 'info' } },
      {}
    );
    expect(result.isValid).toBe(true);
    expect(result.data.LOG_LEVEL).toBe('info');
  });

  it('applies transform function to values', () => {
    const result = envchain(
      { PORT: { required: true, transform: (v) => parseInt(v, 10) } },
      { PORT: '8080' }
    );
    expect(result.data.PORT).toBe(8080);
    expect(typeof result.data.PORT).toBe('number');
  });

  it('applies transform to default values', () => {
    const result = envchain(
      { WORKERS: { default: '4', transform: (v) => parseInt(v, 10) } },
      {}
    );
    expect(result.data.WORKERS).toBe(4);
  });

  it('validates values using a custom validator', () => {
    const result = envchain(
      { NODE_ENV: { required: true, validator: (v) => ['development', 'production', 'test'].includes(v) } },
      { NODE_ENV: 'staging' }
    );
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('NODE_ENV');
  });

  it('passes validation with a valid custom validator', () => {
    const result = envchain(
      { NODE_ENV: { required: true, validator: (v) => ['development', 'production', 'test'].includes(v) } },
      { NODE_ENV: 'production' }
    );
    expect(result.isValid).toBe(true);
  });
});

describe('assertEnv', () => {
  it('returns data when validation passes', () => {
    const data = assertEnv({ DB_URL: { required: true } }, { DB_URL: 'postgres://localhost/db' });
    expect(data.DB_URL).toBe('postgres://localhost/db');
  });

  it('throws an error when validation fails', () => {
    expect(() => assertEnv({ SECRET: { required: true } }, {})).toThrow(
      'Environment validation failed'
    );
  });
});
