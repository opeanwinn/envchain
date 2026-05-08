/**
 * envSecret.ts
 * Utilities for marking, detecting, and safely handling secret environment variables.
 */

export type SecretMeta = {
  key: string;
  masked: boolean;
  redacted: boolean;
};

export type SecretRegistry = Map<string, SecretMeta>;

const SECRET_PATTERN = /secret|password|passwd|token|api_?key|private|credential|auth/i;

/**
 * Creates a new secret registry.
 */
export function createSecretRegistry(): SecretRegistry {
  return new Map();
}

/**
 * Marks a key as secret in the registry.
 */
export function markSecret(
  registry: SecretRegistry,
  key: string,
  options: { masked?: boolean; redacted?: boolean } = {}
): SecretRegistry {
  const updated = new Map(registry);
  updated.set(key, {
    key,
    masked: options.masked ?? true,
    redacted: options.redacted ?? false,
  });
  return updated;
}

/**
 * Returns true if the key is registered as a secret.
 */
export function isSecret(registry: SecretRegistry, key: string): boolean {
  return registry.has(key);
}

/**
 * Auto-detects likely secret keys by pattern matching.
 */
export function detectSecretKeys(env: Record<string, string>): string[] {
  return Object.keys(env).filter((key) => SECRET_PATTERN.test(key));
}

/**
 * Builds a SecretRegistry by auto-detecting secret keys from an env map.
 */
export function buildSecretRegistry(
  env: Record<string, string>,
  extraKeys: string[] = []
): SecretRegistry {
  const registry = createSecretRegistry();
  const detected = detectSecretKeys(env);
  const allKeys = Array.from(new Set([...detected, ...extraKeys]));
  return allKeys.reduce(
    (reg, key) => markSecret(reg, key, { masked: true, redacted: false }),
    registry
  );
}

/**
 * Returns all keys currently registered as secrets.
 */
export function listSecretKeys(registry: SecretRegistry): string[] {
  return Array.from(registry.keys());
}

/**
 * Applies secret handling to an env map: masks or redacts values based on registry.
 */
export function applySecretPolicy(
  env: Record<string, string>,
  registry: SecretRegistry,
  maskChar = "***"
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(env).map(([key, value]) => {
      const meta = registry.get(key);
      if (!meta) return [key, value];
      if (meta.redacted) return [key, "[REDACTED]"];
      if (meta.masked) return [key, maskChar];
      return [key, value];
    })
  );
}
