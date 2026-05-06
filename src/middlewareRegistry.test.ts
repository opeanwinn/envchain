import { createMiddlewareRegistry } from './middlewareRegistry';
import { MiddlewareFn } from './middleware';
import { EnvSchema } from './envchain';

type TestSchema = Record<string, unknown>;
const mockSchema = {} as EnvSchema<TestSchema>;

const upperMw: MiddlewareFn<TestSchema> = (_k, v) =>
  typeof v === 'string' ? v.toUpperCase() : v;

const trimMw: MiddlewareFn<TestSchema> = (_k, v) =>
  typeof v === 'string' ? v.trim() : v;

describe('MiddlewareRegistry', () => {
  it('registers and retrieves middleware by name', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    registry.register('upper', upperMw);
    expect(registry.get('upper')).toBe(upperMw);
  });

  it('returns undefined for unknown names', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('replaces existing middleware on re-registration', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    registry.register('mw', upperMw);
    registry.register('mw', trimMw);
    expect(registry.get('mw')).toBe(trimMw);
    expect(registry.names()).toEqual(['mw']);
  });

  it('unregisters middleware by name', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    registry.register('upper', upperMw);
    registry.unregister('upper');
    expect(registry.get('upper')).toBeUndefined();
    expect(registry.names()).toEqual([]);
  });

  it('builds chain in registration order', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    registry.register('trim', trimMw);
    registry.register('upper', upperMw);
    const chain = registry.buildChain();
    expect(chain).toHaveLength(2);
    // trim then upper
    const result = chain.reduce(
      (v, fn) => fn('KEY', v, mockSchema),
      '  hello  ' as string | undefined
    );
    expect(result).toBe('HELLO');
  });

  it('clears all middlewares', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    registry.register('upper', upperMw);
    registry.clear();
    expect(registry.names()).toEqual([]);
    expect(registry.buildChain()).toHaveLength(0);
  });

  it('supports method chaining', () => {
    const registry = createMiddlewareRegistry<TestSchema>();
    const result = registry
      .register('trim', trimMw)
      .register('upper', upperMw)
      .unregister('trim');
    expect(result).toBe(registry);
    expect(registry.names()).toEqual(['upper']);
  });
});
