import { describe, it, expect } from "vitest";
import {
  toInt,
  toFloat,
  toBool,
  toArray,
  toJson,
  trim,
  toUpperCase,
  toLowerCase,
} from "./transformer";

describe("toInt", () => {
  it("parses a valid integer string", () => {
    expect(toInt("42")).toBe(42);
  });

  it("throws on non-numeric string", () => {
    expect(() => toInt("abc")).toThrow('Cannot transform "abc" to integer');
  });
});

describe("toFloat", () => {
  it("parses a valid float string", () => {
    expect(toFloat("3.14")).toBeCloseTo(3.14);
  });

  it("throws on non-numeric string", () => {
    expect(() => toFloat("xyz")).toThrow('Cannot transform "xyz" to float');
  });
});

describe("toBool", () => {
  it.each([["true"], ["1"], ["yes"], ["TRUE"], ["YES"]])(
    "returns true for %s",
    (val) => {
      expect(toBool(val)).toBe(true);
    }
  );

  it.each([["false"], ["0"], ["no"], ["FALSE"], ["NO"]])(
    "returns false for %s",
    (val) => {
      expect(toBool(val)).toBe(false);
    }
  );

  it("throws on invalid boolean string", () => {
    expect(() => toBool("maybe")).toThrow('Cannot transform "maybe" to boolean');
  });
});

describe("toArray", () => {
  it("splits a comma-separated string", () => {
    expect(toArray("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("trims whitespace around items", () => {
    expect(toArray(" a , b , c ")).toEqual(["a", "b", "c"]);
  });

  it("filters empty entries", () => {
    expect(toArray("a,,b")).toEqual(["a", "b"]);
  });
});

describe("toJson", () => {
  it("parses valid JSON", () => {
    expect(toJson('{"key":"value"}')).toEqual({ key: "value" });
  });

  it("throws on invalid JSON", () => {
    expect(() => toJson("not-json")).toThrow('Cannot transform "not-json" to JSON');
  });
});

describe("trim", () => {
  it("removes surrounding whitespace", () => {
    expect(trim("  hello  ")).toBe("hello");
  });
});

describe("toUpperCase", () => {
  it("converts to uppercase", () => {
    expect(toUpperCase("hello")).toBe("HELLO");
  });
});

describe("toLowerCase", () => {
  it("converts to lowercase", () => {
    expect(toLowerCase("HELLO")).toBe("hello");
  });
});
