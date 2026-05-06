/**
 * envSnapshot.ts
 * Utilities for capturing, comparing, and restoring environment variable snapshots.
 * Useful for testing and auditing environment state changes.
 */

export interface EnvSnapshot {
  readonly timestamp: number;
  readonly data: Readonly<Record<string, string | undefined>>;
}

/**
 * Capture a snapshot of the current process.env (or a provided env object).
 */
export function captureSnapshot(
  env: Record<string, string | undefined> = process.env
): EnvSnapshot {
  return {
    timestamp: Date.now(),
    data: Object.freeze({ ...env }),
  };
}

/**
 * Restore process.env to a previously captured snapshot.
 * Removes keys not present in the snapshot and restores original values.
 */
export function restoreSnapshot(
  snapshot: EnvSnapshot,
  target: Record<string, string | undefined> = process.env
): void {
  // Remove keys not in snapshot
  for (const key of Object.keys(target)) {
    if (!(key in snapshot.data)) {
      delete target[key];
    }
  }
  // Restore snapshot values
  for (const [key, value] of Object.entries(snapshot.data)) {
    if (value === undefined) {
      delete target[key];
    } else {
      target[key] = value;
    }
  }
}

/**
 * Diff two snapshots, returning added, removed, and changed keys.
 */
export interface SnapshotDiff {
  added: Record<string, string>;
  removed: Record<string, string | undefined>;
  changed: Record<string, { from: string | undefined; to: string | undefined }>;
}

export function diffSnapshots(
  before: EnvSnapshot,
  after: EnvSnapshot
): SnapshotDiff {
  const added: Record<string, string> = {};
  const removed: Record<string, string | undefined> = {};
  const changed: Record<string, { from: string | undefined; to: string | undefined }> = {};

  const allKeys = new Set([
    ...Object.keys(before.data),
    ...Object.keys(after.data),
  ]);

  for (const key of allKeys) {
    const beforeVal = before.data[key];
    const afterVal = after.data[key];

    if (!(key in before.data) && afterVal !== undefined) {
      added[key] = afterVal as string;
    } else if (!(key in after.data)) {
      removed[key] = beforeVal;
    } else if (beforeVal !== afterVal) {
      changed[key] = { from: beforeVal, to: afterVal };
    }
  }

  return { added, removed, changed };
}

/**
 * Run a callback with a temporary env override, then restore the original snapshot.
 */
export async function withEnvSnapshot<T>(
  overrides: Record<string, string | undefined>,
  fn: () => T | Promise<T>
): Promise<T> {
  const snapshot = captureSnapshot();
  try {
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    return await fn();
  } finally {
    restoreSnapshot(snapshot);
  }
}
