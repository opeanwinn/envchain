import {
  evaluateConditions,
  whenEquals,
  whenPresent,
  whenMatches,
  allOf,
  anyOf,
  not,
} from "./envCondition";

describe("whenEquals", () => {
  it("returns true when key matches value", () => {
    expect(whenEquals("NODE_ENV", "production")({ NODE_ENV: "production" })).toBe(true);
  });

  it("returns false when key does not match", () => {
    expect(whenEquals("NODE_ENV", "production")({ NODE_ENV: "development" })).toBe(false);
  });
});

describe("whenPresent", () => {
  it("returns true when key is present and non-empty", () => {
    expect(whenPresent("API_KEY")({ API_KEY: "abc" })).toBe(true);
  });

  it("returns false when key is missing", () => {
    expect(whenPresent("API_KEY")({})).toBe(false);
  });

  it("returns false when key is empty string", () => {
    expect(whenPresent("API_KEY")({ API_KEY: "" })).toBe(false);
  });
});

describe("whenMatches", () => {
  it("returns true when value matches pattern", () => {
    expect(whenMatches("PORT", /^\d+$/)({ PORT: "3000" })).toBe(true);
  });

  it("returns false when value does not match", () => {
    expect(whenMatches("PORT", /^\d+$/)({ PORT: "abc" })).toBe(false);
  });
});

describe("allOf", () => {
  it("returns true when all predicates pass", () => {
    const pred = allOf(whenPresent("A"), whenPresent("B"));
    expect(pred({ A: "1", B: "2" })).toBe(true);
  });

  it("returns false when any predicate fails", () => {
    const pred = allOf(whenPresent("A"), whenPresent("B"));
    expect(pred({ A: "1" })).toBe(false);
  });
});

describe("anyOf", () => {
  it("returns true when at least one predicate passes", () => {
    const pred = anyOf(whenPresent("A"), whenPresent("B"));
    expect(pred({ B: "2" })).toBe(true);
  });

  it("returns false when no predicate passes", () => {
    const pred = anyOf(whenPresent("A"), whenPresent("B"));
    expect(pred({})).toBe(false);
  });
});

describe("not", () => {
  it("negates a predicate", () => {
    expect(not(whenPresent("A"))({ A: "x" })).toBe(false);
    expect(not(whenPresent("A"))({})).toBe(true);
  });
});

describe("evaluateConditions", () => {
  it("returns the first matching rule's resolved value", () => {
    const rules = [
      { predicate: whenEquals("ENV", "prod"), resolve: () => "https://api.prod.com" },
      { predicate: whenEquals("ENV", "staging"), resolve: () => "https://api.staging.com" },
    ];
    expect(evaluateConditions({ ENV: "staging" }, rules, "http://localhost")).toBe(
      "https://api.staging.com"
    );
  });

  it("returns fallback when no rule matches", () => {
    expect(evaluateConditions({ ENV: "dev" }, [], "http://localhost")).toBe("http://localhost");
  });
});
