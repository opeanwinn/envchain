import {
  buildDeprecationMessage,
  checkDeprecations,
  createDeprecationProxy,
  filterDeprecatedKeys,
  DeprecationMap,
} from './envDeprecated';
import { createDeprecationMiddleware, mergeDeprecationMaps } from './envDeprecatedMiddleware';

const deprecations: DeprecationMap = {
  OLD_API_KEY: { replacement: 'NEW_API_KEY', since: '2.0' },
  LEGACY_HOST: { message: 'Use SERVICE_HOST instead' },
};

describe('buildDeprecationMessage', () => {
  it('includes key name', () => {
    const msg = buildDeprecationMessage({ key: 'OLD_API_KEY' });
    expect(msg).toContain('OLD_API_KEY');
  });

  it('includes replacement when provided', () => {
    const msg = buildDeprecationMessage({ key: 'OLD_API_KEY', replacement: 'NEW_API_KEY' });
    expect(msg).toContain('NEW_API_KEY');
  });

  it('includes since when provided', () => {
    const msg = buildDeprecationMessage({ key: 'OLD_API_KEY', since: '2.0' });
    expect(msg).toContain('2.0');
  });

  it('includes custom message when provided', () => {
    const msg = buildDeprecationMessage({ key: 'LEGACY_HOST', message: 'Use SERVICE_HOST' });
    expect(msg).toContain('Use SERVICE_HOST');
  });
});

describe('checkDeprecations', () => {
  it('warns for present deprecated keys', () => {
    const warn = jest.fn();
    checkDeprecations({ OLD_API_KEY: 'abc' }, deprecations, warn);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('OLD_API_KEY');
  });

  it('does not warn for absent keys', () => {
    const warn = jest.fn();
    checkDeprecations({ NEW_API_KEY: 'abc' }, deprecations, warn);
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('createDeprecationProxy', () => {
  it('warns on access of deprecated key', () => {
    const warn = jest.fn();
    const proxy = createDeprecationProxy({ OLD_API_KEY: 'val' }, deprecations, warn);
    const _ = proxy['OLD_API_KEY'];
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('warns only once per key', () => {
    const warn = jest.fn();
    const proxy = createDeprecationProxy({ OLD_API_KEY: 'val' }, deprecations, warn);
    proxy['OLD_API_KEY'];
    proxy['OLD_API_KEY'];
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('filterDeprecatedKeys', () => {
  it('removes deprecated keys', () => {
    const result = filterDeprecatedKeys({ OLD_API_KEY: 'x', NEW_API_KEY: 'y' }, deprecations);
    expect(result).not.toHaveProperty('OLD_API_KEY');
    expect(result).toHaveProperty('NEW_API_KEY');
  });
});

describe('createDeprecationMiddleware', () => {
  it('warns eagerly by default', () => {
    const warn = jest.fn();
    const mw = createDeprecationMiddleware(deprecations, { warn });
    mw({ OLD_API_KEY: 'x' });
    expect(warn).toHaveBeenCalled();
  });

  it('strips deprecated keys when strip=true', () => {
    const mw = createDeprecationMiddleware(deprecations, { strip: true, warn: jest.fn() });
    const result = mw({ OLD_API_KEY: 'x', NEW_API_KEY: 'y' });
    expect(result).not.toHaveProperty('OLD_API_KEY');
  });
});

describe('mergeDeprecationMaps', () => {
  it('merges multiple maps', () => {
    const a: DeprecationMap = { KEY_A: {} };
    const b: DeprecationMap = { KEY_B: { replacement: 'KEY_C' } };
    const merged = mergeDeprecationMaps(a, b);
    expect(merged).toHaveProperty('KEY_A');
    expect(merged).toHaveProperty('KEY_B');
  });
});
