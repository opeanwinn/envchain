import { describe, it, expect } from "vitest";
import {
  applyInterpolation,
  mergeInterpolated,
  preprocessEnv,
} from "./interpolationMiddleware";

describe("applyInterpolation", () => {
  it("resolves tokens in values", () => {
    const result = applyInterpolation({
      HOST: "localhost",
      PORT: "5432",
      DB_URL: "postgres://${HOST}:${PORT}/mydb",
    });
    expect(result.DB_URL).toBe("postgres://localhost:5432/mydb");
  });

  it("ignores undefined entries", () => {
    const result = applyInterpolation({ A: "hello", B: undefined });
    expect(Object.keys(result)).not.toContain("B");
    expect(result.A).toBe("hello");
  });

  it("returns empty object for empty input", () => {
    expect(applyInterpolation({})).toEqual({});
  });
});

describe("mergeInterpolated", () => {
  it("overwrites raw values with interpolated ones", () => {
    const raw = { A: "${B}", B: "world", C: undefined };
    const interpolated = { A: "world", B: "world" };
    const merged = mergeInterpolated(raw, interpolated);
    expect(merged.A).toBe("world");
    expect(merged.C).toBeUndefined();
  });

  it("preserves keys not present in interpolated", () => {
    const raw = { X: undefined };
    const merged = mergeInterpolated(raw, {});
    expect(merged).toHaveProperty("X", undefined);
  });
});

describe("preprocessEnv", () => {
  it("resolves and merges in one step", () => {
    const result = preprocessEnv({
      SCHEME: "https",
      DOMAIN: "example.com",
      URL: "${SCHEME}://${DOMAIN}",
      MISSING: undefined,
    });
    expect(result.URL).toBe("https://example.com");
    expect(result.MISSING).toBeUndefined();
  });

  it("throws when interpolation references an undefined variable", () => {
    expect(() =>
      preprocessEnv({ BAD: "${GHOST}" })
    ).toThrow(ReferenceError);
  });
});
