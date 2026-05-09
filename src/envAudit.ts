/**
 * envAudit.ts
 * Tracks access and mutation events on environment variables for auditing purposes.
 */

export type AuditEventType = 'read' | 'write' | 'delete' | 'missing';

export interface AuditEvent {
  key: string;
  type: AuditEventType;
  value?: string;
  timestamp: number;
  source?: string;
}

export interface AuditRegistry {
  events: AuditEvent[];
  maxSize: number;
}

export function createAuditRegistry(maxSize = 500): AuditRegistry {
  return { events: [], maxSize };
}

export function recordAuditEvent(
  registry: AuditRegistry,
  key: string,
  type: AuditEventType,
  value?: string,
  source?: string
): void {
  const event: AuditEvent = { key, type, timestamp: Date.now(), value, source };
  registry.events.push(event);
  if (registry.events.length > registry.maxSize) {
    registry.events.shift();
  }
}

export function getAuditLog(registry: AuditRegistry): AuditEvent[] {
  return [...registry.events];
}

export function filterAuditLog(
  registry: AuditRegistry,
  predicate: (event: AuditEvent) => boolean
): AuditEvent[] {
  return registry.events.filter(predicate);
}

export function clearAuditLog(registry: AuditRegistry): void {
  registry.events = [];
}

export function auditSummary(
  registry: AuditRegistry
): Record<AuditEventType, number> {
  const summary: Record<AuditEventType, number> = {
    read: 0,
    write: 0,
    delete: 0,
    missing: 0,
  };
  for (const event of registry.events) {
    summary[event.type]++;
  }
  return summary;
}

export function formatAuditReport(registry: AuditRegistry): string {
  const lines = registry.events.map((e) => {
    const ts = new Date(e.timestamp).toISOString();
    const val = e.value !== undefined ? ` value=${e.value}` : '';
    const src = e.source ? ` source=${e.source}` : '';
    return `[${ts}] ${e.type.toUpperCase()} ${e.key}${val}${src}`;
  });
  return lines.join('\n');
}
