/**
 * envMaskMiddleware.ts
 * Middleware integration for masking sensitive environment variables.
 */

import { maskEnv, maskEnvByPattern, MaskOptions } from './envMask';

export type MaskMiddlewareOptions = MaskOptions & {
  keys?: string[];
  pattern?: RegExp;
};

/**
 * Creates a middleware that masks sensitive keys before further processing.
 * Useful for logging or snapshot capture without leaking secrets.
 */
export function createMaskMiddleware(
  options: MaskMiddlewareOptions = {}
) {
  const { keys = [], pattern, ...maskOptions } = options;

  return function maskMiddleware(
    env: Record<string, string>
  ): Record<string, string> {
    let result = { ...env };

    if (keys.length > 0) {
      result = maskEnv(result, keys, maskOptions);
    }

    if (pattern) {
      result = maskEnvByPattern(result, pattern, maskOptions);
    }

    return result;
  };
}

/**
 * Convenience: mask keys matching common secret patterns (e.g. *_SECRET, *_KEY, *_TOKEN, *_PASSWORD).
 */
export function createDefaultSecretMaskMiddleware(
  options: MaskOptions = {}
) {
  const secretPattern = /(_SECRET|_KEY|_TOKEN|_PASSWORD|_PASS|_CREDENTIAL)$/i;
  return createMaskMiddleware({ pattern: secretPattern, ...options });
}
