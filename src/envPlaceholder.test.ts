import {
  isPlaceholder,
  findPlaceholderKeys,
  stripPlaceholders,
  assertNoPlaceholders,
  replacePlaceholders,
} from "./envPlaceholder";

describe("isPlaceholder", () => {
  it("detects angle-bracket placeholders", () => {
    expect(isPlaceholder("<MY_SECRET>")).toBe(true);
    expect(isPlaceholder("<CHANGE_ME>")).toBe(true);
  });

  it("detects dunder placeholders", () => {
    expect(isPlaceholder("__TOKEN__")).toBe(true);
    expect(isPlaceholder("__API_KEY__")).toBe(true);
  });

  it("detects template-style placeholders", () => {
    expect(isPlaceholder("${MY_VAR}")).toBe(true);
  });

  it("detects TODO and CHANGE_ME keywords", () => {
    expect(isPlaceholder("TODO")).toBe(true);
    expect(isPlaceholder("todo")).toBe(true);
    expect(isPlaceholder("CHANGE_ME")).toBe(true);
    expect(isPlaceholder("CHANGEME")).toBe(true);
    expect(isPlaceholder("PLACEHOLDER")).toBe(true);
  });

  it("returns false for real values", () => {
    expect(isPlaceholder("my-real-secret")).toBe(false);
    expect(isPlaceholder("https://example.com")).toBe(false);
    expect(isPlaceholder("42")).toBe(false);
  });

  it("supports custom string patterns", () => {
    expect(isPlaceholder("REPLACE_THIS", ["REPLACE_THIS"])).toBe(true);
    expect(isPlaceholder("keep-this", ["REPLACE_THIS"])).toBe(false);
  });

  it("supports custom regex patterns", () => {
    expect(isPlaceholder("FAKE_VALUE", [/^FAKE_/])).toBe(true);
    expect(isPlaceholder("REAL_VALUE", [/^FAKE_/])).toBe(false);
  });
});

describe("findPlaceholderKeys", () => {
  it("returns keys with placeholder values", () => {
    const env = {
      API_KEY: "<YOUR_API_KEY>",
      DB_HOST: "localhost",
      SECRET: "__SECRET__",
    };
    expect(findPlaceholderKeys(env)).toEqual(["API_KEY", "SECRET"]);
  });

  it("returns empty array when no placeholders", () => {
    const env = { HOST: "localhost", PORT: "3000" };
    expect(findPlaceholderKeys(env)).toEqual([]);
  });
});

describe("stripPlaceholders", () => {
  it("removes entries with placeholder values", () => {
    const env = { API_KEY: "<API_KEY>", HOST: "localhost" };
    expect(stripPlaceholders(env)).toEqual({ HOST: "localhost" });
  });
});

describe("assertNoPlaceholders", () => {
  it("throws when placeholders are found", () => {
    const env = { API_KEY: "<YOUR_KEY>" };
    expect(() => assertNoPlaceholders(env)).toThrow(
      /unresolved placeholder values for keys: API_KEY/
    );
  });

  it("does not throw when env is clean", () => {
    const env = { API_KEY: "real-key" };
    expect(() => assertNoPlaceholders(env)).not.toThrow();
  });
});

describe("replacePlaceholders", () => {
  it("replaces placeholder values with provided replacements", () => {
    const env = { API_KEY: "<YOUR_KEY>", HOST: "localhost" };
    const result = replacePlaceholders(env, { API_KEY: "secret-123" });
    expect(result).toEqual({ API_KEY: "secret-123", HOST: "localhost" });
  });

  it("leaves non-placeholder values unchanged", () => {
    const env = { HOST: "localhost" };
    const result = replacePlaceholders(env, { HOST: "other" });
    expect(result).toEqual({ HOST: "localhost" });
  });

  it("ignores replacements for keys not in env", () => {
    const env = { API_KEY: "<KEY>" };
    const result = replacePlaceholders(env, { OTHER: "value" });
    expect(result).toEqual({ API_KEY: "<KEY>" });
  });
});
