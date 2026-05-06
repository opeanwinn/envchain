/**
 * Middleware that applies interpolation to raw env values before
 * the field pipeline processes them, enabling ${VAR} references
 * inside environment variable values.
 */

import { interpolateAll, InterpolationContext } from "./interpolation";

export type RawEnv = Record<string, string | undefined>;

/**
 * Pre-processes a raw env object by resolving all ${KEY} references.
 * Returns a new object with interpolated string values.
 */
export function applyInterpolation(rawEnv: RawEnv): Record<string, string> {
  const stringOnly: InterpolationContext = {};

  for (const [k, v] of Object.entries(rawEnv)) {
    if (v !== undefined) stringOnly[k] = v;
  }

  return interpolateAll(stringOnly);
}

/**
 * Merges interpolated values back with undefined entries so that
 * downstream required/optional checks still work correctly.
 */
export function mergeInterpolated(
  rawEnv: RawEnv,
  interpolated: Record<string, string>
): RawEnv {
  const merged: RawEnv = { ...rawEnv };

  for (const [k, v] of Object.entries(interpolated)) {
    merged[k] = v;
  }

  return merged;
}

/**
 * Convenience function: applies interpolation and merges the result.
 */
export function preprocessEnv(rawEnv: RawEnv): RawEnv {
  const interpolated = applyInterpolation(rawEnv);
  return mergeInterpolated(rawEnv, interpolated);
}
