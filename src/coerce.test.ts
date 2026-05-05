import { describe, it, expect } from "vitest";
import {
  coerceString,
  coerceNumber,
  coerceBoolean,
  coerceInteger,
  coerceArray,
  coerceUrl,
} from "./coerce";

describe("coerceString", () => {
  it("trims whitespace from string values", () => {
    expect(coerceString("  hello  ")).toBe("hello");
  });

  it("returns the string as-is if no whitespace", () => {
    expect(coerceString("world")).toBe("world");
  });
});

describe("coerceNumber", () => {
  it("coerces a numeric string to a number", () => {
    expect(coerceNumber("42")).toBe(42);
    expect(coerceNumber("3.14")).toBe(3.14);
    expect(coerceNumber("-7")).toBe(-7);
  });

  it("handles whitespace around numeric strings", () => {
    expect(coerceNumber(" 10 ")).toBe(10);
  });

  it("throws TypeError for non-numeric strings", () => {
    expect(() => coerceNumber("abc")).toThrow(TypeError);
  });
});

describe("coerceBoolean", () => {
  it.each([["true"], ["1"], ["yes"], ["on"], ["TRUE"], ["YES"]])(
    "coerces truthy string %s to true",
    (value) => {
      expect(coerceBoolean(value)).toBe(true);
    }
  );

  it.each([["false"], ["0"], ["no"], ["off"], ["FALSE"], ["NO"]])(
    "coerces falsy string %s to false",
    (value) => {
      expect(coerceBoolean(value)).toBe(false);
    }
  );

  it("throws TypeError for unrecognized boolean strings", () => {
    expect(() => coerceBoolean("maybe")).toThrow(TypeError);
  });
});

describe("coerceInteger", () => {
  it("coerces a numeric string to an integer", () => {
    expect(coerceInteger("42")).toBe(42);
  });

  it("truncates decimal values", () => {
    expect(coerceInteger("3.9")).toBe(3);
    expect(coerceInteger("-3.9")).toBe(-3);
  });

  it("throws TypeError for non-numeric strings", () => {
    expect(() => coerceInteger("abc")).toThrow(TypeError);
  });
});

describe("coerceArray", () => {
  it("splits a comma-separated string into an array", () => {
    expect(coerceArray("foo,bar,baz")).toEqual(["foo", "bar", "baz"]);
  });

  it("trims whitespace from each item", () => {
    expect(coerceArray("foo, bar , baz")).toEqual(["foo", "bar", "baz"]);
  });

  it("filters out empty items", () => {
    expect(coerceArray("foo,,bar")).toEqual(["foo", "bar"]);
  });
});

describe("coerceUrl", () => {
  it("coerces a valid URL string to a URL object", () => {
    const url = coerceUrl("https://example.com");
    expect(url).toBeInstanceOf(URL);
    expect(url.hostname).toBe("example.com");
  });

  it("throws TypeError for invalid URL strings", () => {
    expect(() => coerceUrl("not-a-url")).toThrow(TypeError);
  });
});
