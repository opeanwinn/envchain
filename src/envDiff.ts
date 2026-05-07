/**
 * envDiff.ts
 * Utilities for comparing two environment maps and producing structured diff reports.
 */

export type DiffKind = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffEntry {
  key: string;
  kind: DiffKind;
  oldValue?: string;
  newValue?: string;
}

export interface EnvDiffReport {
  added: DiffEntry[];
  removed: DiffEntry[];
  changed: DiffEntry[];
  unchanged: DiffEntry[];
  all: DiffEntry[];
}

export function diffEnvMaps(
  before: Record<string, string>,
  after: Record<string, string>
): EnvDiffReport {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const added: DiffEntry[] = [];
  const removed: DiffEntry[] = [];
  const changed: DiffEntry[] = [];
  const unchanged: DiffEntry[] = [];

  for (const key of allKeys) {
    const inBefore = Object.prototype.hasOwnProperty.call(before, key);
    const inAfter = Object.prototype.hasOwnProperty.call(after, key);

    if (!inBefore && inAfter) {
      added.push({ key, kind: 'added', newValue: after[key] });
    } else if (inBefore && !inAfter) {
      removed.push({ key, kind: 'removed', oldValue: before[key] });
    } else if (before[key] !== after[key]) {
      changed.push({ key, kind: 'changed', oldValue: before[key], newValue: after[key] });
    } else {
      unchanged.push({ key, kind: 'unchanged', oldValue: before[key], newValue: after[key] });
    }
  }

  return {
    added,
    removed,
    changed,
    unchanged,
    all: [...added, ...removed, ...changed, ...unchanged],
  };
}

export function hasDiff(report: EnvDiffReport): boolean {
  return report.added.length > 0 || report.removed.length > 0 || report.changed.length > 0;
}

export function filterDiff(report: EnvDiffReport, kind: DiffKind): DiffEntry[] {
  return report.all.filter((e) => e.kind === kind);
}

export function formatDiffReport(report: EnvDiffReport): string {
  const lines: string[] = [];
  for (const entry of report.added) lines.push(`+ ${entry.key}=${entry.newValue}`);
  for (const entry of report.removed) lines.push(`- ${entry.key}=${entry.oldValue}`);
  for (const entry of report.changed)
    lines.push(`~ ${entry.key}: ${entry.oldValue} → ${entry.newValue}`);
  return lines.join('\n');
}
