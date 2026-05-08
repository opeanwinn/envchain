import {
  createAccessMiddleware,
  createLevelFilterMiddleware,
  composeAccessMiddlewares,
} from './envAccessMiddleware';
import { createAccessRegistry } from './envAccess';

const registry = createAccessRegistry({
  DB_PASS: { level: 'secret', allowedRoles: ['admin'] },
  INTERNAL_TOKEN: { level: 'internal', allowedRoles: ['admin', 'service'] },
  APP_NAME: { level: 'public', allowedRoles: ['admin', 'service', 'viewer'] },
});

const env = {
  DB_PASS: 'supersecret',
  INTERNAL_TOKEN: 'tok123',
  APP_NAME: 'envchain',
};

describe('createAccessMiddleware', () => {
  it('filters env based on role', () => {
    const mw = createAccessMiddleware({ role: 'viewer', registry });
    const result = mw(env);
    expect(result).toHaveProperty('APP_NAME');
    expect(result).not.toHaveProperty('DB_PASS');
    expect(result).not.toHaveProperty('INTERNAL_TOKEN');
  });

  it('calls onDenied with denied keys', () => {
    const onDenied = jest.fn();
    const mw = createAccessMiddleware({ role: 'viewer', registry, onDenied });
    mw(env);
    expect(onDenied).toHaveBeenCalledWith(expect.arrayContaining(['DB_PASS', 'INTERNAL_TOKEN']));
  });

  it('does not call onDenied when no keys are denied', () => {
    const onDenied = jest.fn();
    const mw = createAccessMiddleware({ role: 'admin', registry, onDenied });
    mw(env);
    expect(onDenied).not.toHaveBeenCalled();
  });
});

describe('createLevelFilterMiddleware', () => {
  it('filters keys above specified level', () => {
    const mw = createLevelFilterMiddleware(registry, 'internal');
    const result = mw(env);
    expect(result).not.toHaveProperty('DB_PASS');
    expect(result).toHaveProperty('INTERNAL_TOKEN');
    expect(result).toHaveProperty('APP_NAME');
  });

  it('filters nothing when level is restricted', () => {
    const mw = createLevelFilterMiddleware(registry, 'restricted');
    const result = mw(env);
    expect(Object.keys(result)).toHaveLength(3);
  });
});

describe('composeAccessMiddlewares', () => {
  it('applies multiple middlewares in order', () => {
    const mw1 = createAccessMiddleware({ role: 'service', registry });
    const mw2 = createLevelFilterMiddleware(registry, 'public');
    const composed = composeAccessMiddlewares(mw1, mw2);
    const result = composed(env);
    expect(result).toHaveProperty('APP_NAME');
    expect(result).not.toHaveProperty('DB_PASS');
    expect(result).not.toHaveProperty('INTERNAL_TOKEN');
  });
});
