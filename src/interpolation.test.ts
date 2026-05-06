import { describe, it, expect } from "vitest";
import {
  hasInterpolation,
  interpolate,
  interpolateAll,
} from "./interpolation";

describe("hasInterpolation", () => {
  it("returns true when value contains ${} token", () => {
    expect(hasInterpolation("hello ${NAME}")).toBe(true);
  });

  it("returns false for plain strings", () => {
    expect(hasInterpolation("hello world")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasInterpolation("")).toBe(false);
  });
});

describe("interpolate", () => {
  it("replaces a single token", () => {
    expect(interpolate("Hello ${NAME}!", { NAME: "Alice" })).toBe(
      "Hello Alice!"
    );
  });

  it("replaces multiple tokens", () => {
    expect(
      interpolate("${PROTO}://${HOST}:${PORT}", {
        PROTO: "https",
        HOST: "example.com",
        PORT: "8080",
      })
    ).toBe("https://example.com:8080");
  });

  it("throws ReferenceError for missing key", () => {
    expect(() => interpolate("${MISSING}", {})).toThrow(ReferenceError);
    expect(() => interpolate("${MISSING}", {})).toThrow(
      /variable "MISSING" is not defined/
    );
  });

  it("leaves non-token text unchanged", () => {
    expect(interpolate("no tokens here", {})).toBe("no tokens here");
  });
});

describe("interpolateAll", () => {
  it("resolves cross-references within a record", () => {
    const result = interpolateAll({
      HOST: "example.com",
      PORT: "3000",
      BASE_URL: "http://${HOST}:${PORT}",
    });
    expect(result.BASE_URL).toBe("http://example.com:3000");
  });

  it("skips undefined values", () => {
    const result = interpolateAll({ A: "hello", B: undefined });
    expect(result).not.toHaveProperty("B");
  });

  it("returns plain values unchanged", () => {
    const result = interpolateAll({ FOO: "bar", BAZ: "qux" });
    expect(result).toEqual({ FOO: "bar", BAZ: "qux" });
  });

  it("throws when a referenced variable is absent", () => {
    expect(() =>
      interpolateAll({ URL: "http://${UNDEFINED_HOST}" })
    ).toThrow(ReferenceError);
  });
});
