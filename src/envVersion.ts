/**
 * envVersion.ts
 * Utilities for versioning and tracking env schema changes over time.
 */

export interface EnvVersion {
  version: number;
  timestamp: number;
  checksum: string;
  keys: string[];
}

export interface VersionRegistry {
  current: EnvVersion | null;
  history: EnvVersion[];
}

/**
 * Compute a simple checksum from an env map's keys and values.
 */
export function computeChecksum(env: Record<string, string>): string {
  const entries = Object.entries(env)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  let hash = 0;
  for (let i = 0; i < entries.length; i++) {
    const char = entries.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

/**
 * Create a new version entry from an env map.
 */
export function createVersion(
  env: Record<string, string>,
  version: number
): EnvVersion {
  return {
    version,
    timestamp: Date.now(),
    checksum: computeChecksum(env),
    keys: Object.keys(env).sort(),
  };
}

/**
 * Create a new version registry.
 */
export function createVersionRegistry(): VersionRegistry {
  return { current: null, history: [] };
}

/**
 * Record a new env snapshot into the registry.
 */
export function recordVersion(
  registry: VersionRegistry,
  env: Record<string, string>
): VersionRegistry {
  const nextVersion = (registry.current?.version ?? 0) + 1;
  const newEntry = createVersion(env, nextVersion);
  const history = registry.current
    ? [...registry.history, registry.current]
    : registry.history;
  return { current: newEntry, history };
}

/**
 * Check whether the env has changed compared to the current version.
 */
export function hasVersionChanged(
  registry: VersionRegistry,
  env: Record<string, string>
): boolean {
  if (!registry.current) return true;
  return registry.current.checksum !== computeChecksum(env);
}

/**
 * Retrieve a version by its version number.
 */
export function getVersionByNumber(
  registry: VersionRegistry,
  version: number
): EnvVersion | undefined {
  if (registry.current?.version === version) return registry.current;
  return registry.history.find((v) => v.version === version);
}
