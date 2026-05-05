import { describe, it, expect } from "vitest";
import {
  parseString,
  parseNumber,
  parseInteger,
  parseBoolean,
  parseJson,
  parseEnum,
} from "./parser";

describe("parseString", () => {
  it("returns the raw string as-is", () => {
    expect(parseString("hello")).toEqual({ success: true, value: "hello" });
  });
});

describe("parseNumber", () => {
  it("parses valid numbers", () => {
    expect(parseNumber("3.14")).toEqual({ success: true, value: 3.14 });
    expect(parseNumber("42")).toEqual({ success: true, value: 42 });
  });

  it("fails on non-numeric strings", () => {
    const result = parseNumber("abc");
    expect(result.success).toBe(false);
  });
});

describe("parseInteger", () => {
  it("parses valid integers", () => {
    expect(parseInteger("10")).toEqual({ success: true, value: 10 });
  });

  it("fails on floats", () => {
    const result = parseInteger("3.14");
    expect(result.success).toBe(false);
  });

  it("fails on non-numeric strings", () => {
    const result = parseInteger("xyz");
    expect(result.success).toBe(false);
  });
});

describe("parseBoolean", () => {
  it.each(["true", "1", "yes", "on", "TRUE", "YES"])(
    "parses truthy value '%s'",
    (val) => {
      expect(parseBoolean(val)).toEqual({ success: true, value: true });
    }
  );

  it.each(["false", "0", "no", "off", "FALSE"])(
    "parses falsy value '%s'",
    (val) => {
      expect(parseBoolean(val)).toEqual({ success: true, value: false });
    }
  );

  it("fails on invalid boolean string", () => {
    const result = parseBoolean("maybe");
    expect(result.success).toBe(false);
  });
});

describe("parseJson", () => {
  it("parses valid JSON", () => {
    expect(parseJson<{ a: number }>('{ "a": 1 }')).toEqual({
      success: true,
      value: { a: 1 },
    });
  });

  it("fails on invalid JSON", () => {
    const result = parseJson("{bad json}");
    expect(result.success).toBe(false);
  });
});

describe("parseEnum", () => {
  const parse = parseEnum(["dev", "staging", "prod"] as const);

  it("accepts valid enum values", () => {
    expect(parse("dev")).toEqual({ success: true, value: "dev" });
    expect(parse("prod")).toEqual({ success: true, value: "prod" });
  });

  it("rejects invalid enum values", () => {
    const result = parse("local");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("dev, staging, prod");
    }
  });
});
