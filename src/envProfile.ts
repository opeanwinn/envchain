/**
 * envProfile.ts
 * Manage named environment profiles (e.g. "development", "test", "production").
 * Each profile is a labelled snapshot of key-value pairs that can be activated
 * or compared against the current environment.
 */

export interface EnvProfile {
  name: string;
  env: Record<string, string>;
  createdAt: number;
}

export interface ProfileRegistry {
  profiles: Map<string, EnvProfile>;
}

export function createProfileRegistry(): ProfileRegistry {
  return { profiles: new Map() };
}

export function defineProfile(
  registry: ProfileRegistry,
  name: string,
  env: Record<string, string>
): EnvProfile {
  const profile: EnvProfile = { name, env: { ...env }, createdAt: Date.now() };
  registry.profiles.set(name, profile);
  return profile;
}

export function getProfile(
  registry: ProfileRegistry,
  name: string
): EnvProfile | undefined {
  return registry.profiles.get(name);
}

export function listProfiles(registry: ProfileRegistry): string[] {
  return Array.from(registry.profiles.keys());
}

export function activateProfile(
  registry: ProfileRegistry,
  name: string
): Record<string, string> {
  const profile = registry.profiles.get(name);
  if (!profile) {
    throw new Error(`[envchain] Profile "${name}" is not defined.`);
  }
  return { ...profile.env };
}

export function removeProfile(
  registry: ProfileRegistry,
  name: string
): boolean {
  return registry.profiles.delete(name);
}

export function diffProfiles(
  a: EnvProfile,
  b: EnvProfile
): Record<string, { from: string | undefined; to: string | undefined }> {
  const keys = new Set([...Object.keys(a.env), ...Object.keys(b.env)]);
  const diff: Record<string, { from: string | undefined; to: string | undefined }> = {};
  for (const key of keys) {
    if (a.env[key] !== b.env[key]) {
      diff[key] = { from: a.env[key], to: b.env[key] };
    }
  }
  return diff;
}
