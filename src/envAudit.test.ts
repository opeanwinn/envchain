import {
  createAuditRegistry,
  recordAuditEvent,
  getAuditLog,
  filterAuditLog,
  clearAuditLog,
  auditSummary,
  formatAuditReport,
} from './envAudit';
import {
  createAuditMiddleware,
  createWriteAuditMiddleware,
  createDefaultAuditMiddleware,
} from './envAuditMiddleware';

describe('createAuditRegistry', () => {
  it('creates an empty registry with default maxSize', () => {
    const reg = createAuditRegistry();
    expect(reg.events).toHaveLength(0);
    expect(reg.maxSize).toBe(500);
  });

  it('respects custom maxSize', () => {
    const reg = createAuditRegistry(10);
    expect(reg.maxSize).toBe(10);
  });
});

describe('recordAuditEvent', () => {
  it('records a read event', () => {
    const reg = createAuditRegistry();
    recordAuditEvent(reg, 'API_KEY', 'read', 'secret', 'test');
    expect(reg.events).toHaveLength(1);
    expect(reg.events[0]).toMatchObject({ key: 'API_KEY', type: 'read', value: 'secret', source: 'test' });
  });

  it('evicts oldest event when maxSize exceeded', () => {
    const reg = createAuditRegistry(2);
    recordAuditEvent(reg, 'A', 'read');
    recordAuditEvent(reg, 'B', 'read');
    recordAuditEvent(reg, 'C', 'read');
    expect(reg.events).toHaveLength(2);
    expect(reg.events[0].key).toBe('B');
  });
});

describe('getAuditLog', () => {
  it('returns a copy of the events', () => {
    const reg = createAuditRegistry();
    recordAuditEvent(reg, 'X', 'write', '1');
    const log = getAuditLog(reg);
    log.push({ key: 'Y', type: 'read', timestamp: Date.now() });
    expect(reg.events).toHaveLength(1);
  });
});

describe('filterAuditLog', () => {
  it('filters by event type', () => {
    const reg = createAuditRegistry();
    recordAuditEvent(reg, 'A', 'read');
    recordAuditEvent(reg, 'B', 'write');
    const reads = filterAuditLog(reg, (e) => e.type === 'read');
    expect(reads).toHaveLength(1);
    expect(reads[0].key).toBe('A');
  });
});

describe('clearAuditLog', () => {
  it('clears all events', () => {
    const reg = createAuditRegistry();
    recordAuditEvent(reg, 'A', 'read');
    clearAuditLog(reg);
    expect(reg.events).toHaveLength(0);
  });
});

describe('auditSummary', () => {
  it('counts events by type', () => {
    const reg = createAuditRegistry();
    recordAuditEvent(reg, 'A', 'read');
    recordAuditEvent(reg, 'B', 'read');
    recordAuditEvent(reg, 'C', 'write');
    recordAuditEvent(reg, 'D', 'missing');
    const summary = auditSummary(reg);
    expect(summary.read).toBe(2);
    expect(summary.write).toBe(1);
    expect(summary.missing).toBe(1);
    expect(summary.delete).toBe(0);
  });
});

describe('formatAuditReport', () => {
  it('formats events as lines', () => {
    const reg = createAuditRegistry();
    recordAuditEvent(reg, 'KEY', 'read', 'val', 'src');
    const report = formatAuditReport(reg);
    expect(report).toContain('READ KEY');
    expect(report).toContain('value=val');
    expect(report).toContain('source=src');
  });
});

describe('createAuditMiddleware', () => {
  it('records read events for defined keys', () => {
    const reg = createAuditRegistry();
    const mw = createAuditMiddleware(reg);
    mw({ FOO: 'bar', BAZ: undefined });
    expect(filterAuditLog(reg, (e) => e.type === 'read')).toHaveLength(1);
    expect(filterAuditLog(reg, (e) => e.type === 'missing')).toHaveLength(1);
  });

  it('passes env through unchanged', () => {
    const reg = createAuditRegistry();
    const mw = createAuditMiddleware(reg);
    const result = mw({ FOO: 'bar' });
    expect(result).toEqual({ FOO: 'bar' });
  });
});

describe('createWriteAuditMiddleware', () => {
  it('records write events', () => {
    const reg = createAuditRegistry();
    const mw = createWriteAuditMiddleware(reg, 'loader');
    mw({ DB_URL: 'postgres://localhost' });
    expect(reg.events[0]).toMatchObject({ key: 'DB_URL', type: 'write', source: 'loader' });
  });
});

describe('createDefaultAuditMiddleware', () => {
  it('returns registry and middleware', () => {
    const { registry, middleware } = createDefaultAuditMiddleware('default');
    middleware({ TOKEN: 'abc' });
    expect(registry.events).toHaveLength(1);
  });
});
