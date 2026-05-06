import { composeMiddleware, applyMiddlewareChain, trimMiddleware, maskMiddleware } from './middleware';
import { createMiddlewareRegistry } from './middlewareRegistry';
import { EnvSchema } from './envchain';

type TestSchema = { API_KEY: string; HOST: string; PORT: string };
const mockSchema = {} as EnvSchema<TestSchema>;

describe('middleware + registry integration', () => {
  it('builds and applies a full chain via registry', () => {
    const registry = createMiddlewareRegistry<TestSchema>();

    registry
      .register('trim', trimMiddleware())
      .register('mask', maskMiddleware(['API_KEY']));

    const env: Record<string, string | undefined> = {
      API_KEY: '  super-secret  ',
      HOST: '  localhost  ',
      PORT: '  3000  ',
    };

    const chain = registry.buildChain();
    const result = applyMiddlewareChain(env, mockSchema, chain);

    expect(result['API_KEY']).toBe('***');
    expect(result['HOST']).toBe('localhost');
    expect(result['PORT']).toBe('3000');
  });

  it('composed middleware applies trim before mask', () => {
    const composed = composeMiddleware<TestSchema>(
      trimMiddleware(),
      maskMiddleware(['API_KEY'])
    );

    expect(composed('API_KEY', '  secret  ', mockSchema)).toBe('***');
    expect(composed('HOST', '  localhost  ', mockSchema)).toBe('localhost');
  });

  it('empty registry produces no-op chain', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    const env = { FOO: '  bar  ' };
    const result = applyMiddlewareChain(env, mockSchema, registry.buildChain());
    expect(result).toEqual({ FOO: '  bar  ' });
  });

  it('handles undefined values throughout the chain', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    registry
      .register('trim', trimMiddleware())
      .register('mask', maskMiddleware(['API_KEY']));

    const env: Record<string, string | undefined> = {
      API_KEY: undefined,
      HOST: undefined,
    };

    const chain = registry.buildChain();
    const result = applyMiddlewareChain(env, mockSchema, chain);

    expect(result['API_KEY']).toBeUndefined();
    expect(result['HOST']).toBeUndefined();
  });
});
