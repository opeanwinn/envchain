import { describe, it, expect } from "vitest";
import {
  mergeEnvSources,
  diffEnvSources,
  pickEnvKeys,
} from "./envMerge";

describe("mergeEnvSources", () => {
  it("merges two sources with last-wins strategy by default", () => {
    const a = { FOO: "a", BAR: "a" };
    const b = { FOO: "b", BAZ: "b" };
    const { env } = mergeEnvSources([a, b]);
    expect(env.FOO).toBe("b");
    expect(env.BAR).toBe("a");
    expect(env.BAZ).toBe("b");
  });

  it("respects first-wins strategy", () => {
    const a = { FOO: "first" };
    const b = { FOO: "second" };
    const { env } = mergeEnvSources([a, b], { strategy: "first-wins" });
    expect(env.FOO).toBe("first");
  });

  it("tracks conflicts across sources", () => {
    const a = { FOO: "1" };
    const b = { FOO: "2" };
    const c = { FOO: "3" };
    const { conflicts } = mergeEnvSources([a, b, c]);
    expect(conflicts.FOO).toBeDefined();
    expect(conflicts.FOO).toContain("2");
    expect(conflicts.FOO).toContain("3");
  });

  it("throws on conflict when strategy is error-on-conflict", () => {
    const a = { FOO: "x" };
    const b = { FOO: "y" };
    expect(() =>
      mergeEnvSources([a, b], { strategy: "error-on-conflict" })
    ).toThrow(/conflict detected for key "FOO"/);
  });

  it("ignores undefined values by default", () => {
    const a = { FOO: "defined" };
    const b = { FOO: undefined };
    const { env } = mergeEnvSources([a, b], { strategy: "last-wins" });
    // undefined is skipped, so FOO stays as "defined"
    expect(env.FOO).toBe("defined");
  });

  it("includes undefined values when ignoreUndefined is false", () => {
    const a = { FOO: "defined" };
    const b = { FOO: undefined };
    const { env } = mergeEnvSources([a, b], {
      strategy: "last-wins",
      ignoreUndefined: false,
    });
    expect(env.FOO).toBeUndefined();
  });

  it("returns empty conflicts when no overlap", () => {
    const a = { A: "1" };
    const b = { B: "2" };
    const { conflicts } = mergeEnvSources([a, b]);
    expect(Object.keys(conflicts)).toHaveLength(0);
  });
});

describe("diffEnvSources", () => {
  it("detects changed values", () => {
    const base = { FOO: "old", BAR: "same" };
    const override = { FOO: "new", BAR: "same" };
    const diff = diffEnvSources(base, override);
    expect(diff.FOO).toEqual({ base: "old", override: "new" });
    expect(diff.BAR).toBeUndefined();
  });

  it("detects added keys", () => {
    const diff = diffEnvSources({}, { NEW_KEY: "value" });
    expect(diff.NEW_KEY).toEqual({ base: undefined, override: "value" });
  });

  it("detects removed keys", () => {
    const diff = diffEnvSources({ GONE: "val" }, {});
    expect(diff.GONE).toEqual({ base: "val", override: undefined });
  });
});

describe("pickEnvKeys", () => {
  it("picks only specified keys", () => {
    const source = { A: "1", B: "2", C: "3" };
    const result = pickEnvKeys(source, ["A", "C"]);
    expect(result).toEqual({ A: "1", C: "3" });
  });

  it("ignores keys not present in source", () => {
    const source = { A: "1" };
    const result = pickEnvKeys(source, ["A", "MISSING"]);
    expect(Object.keys(result)).toEqual(["A"]);
  });
});
