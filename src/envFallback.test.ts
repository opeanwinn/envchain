import {
  resolveWithFallback,
  applyFallbackChains,
  availableInChain,
  chainResolvable,
} from "./envFallback";

describe("resolveWithFallback", () => {
  const env = { A: "alpha", B: "", C: "charlie" };

  it("returns the first defined non-empty value", () => {
    const result = resolveWithFallback(env, ["B", "A", "C"]);
    expect(result).toEqual({ key: "A", value: "alpha", resolved: true });
  });

  it("returns resolved=false when no key matches", () => {
    const result = resolveWithFallback(env, ["B", "MISSING"]);
    expect(result).toEqual({ key: null, value: undefined, resolved: false });
  });

  it("returns the first key if it has a value", () => {
    const result = resolveWithFallback(env, ["A", "C"]);
    expect(result).toEqual({ key: "A", value: "alpha", resolved: true });
  });

  it("handles empty chain", () => {
    const result = resolveWithFallback(env, []);
    expect(result).toEqual({ key: null, value: undefined, resolved: false });
  });
});

describe("applyFallbackChains", () => {
  it("fills missing target keys from chain", () => {
    const env = { OLD_HOST: "localhost" };
    const result = applyFallbackChains(env, { HOST: ["OLD_HOST"] });
    expect(result.HOST).toBe("localhost");
  });

  it("does not overwrite existing target key", () => {
    const env = { HOST: "prod.host", OLD_HOST: "localhost" };
    const result = applyFallbackChains(env, { HOST: ["OLD_HOST"] });
    expect(result.HOST).toBe("prod.host");
  });

  it("leaves target undefined if chain has no match", () => {
    const env = { OTHER: "value" };
    const result = applyFallbackChains(env, { HOST: ["MISSING"] });
    expect(result.HOST).toBeUndefined();
  });

  it("does not mutate the original env", () => {
    const env = { OLD_PORT: "3000" };
    applyFallbackChains(env, { PORT: ["OLD_PORT"] });
    expect((env as Record<string, string | undefined>).PORT).toBeUndefined();
  });
});

describe("availableInChain", () => {
  it("returns keys that are defined and non-empty", () => {
    const env = { A: "1", B: "", C: "3" };
    expect(availableInChain(env, ["A", "B", "C", "D"])).toEqual(["A", "C"]);
  });

  it("returns empty array when nothing is available", () => {
    const env = { A: "" };
    expect(availableInChain(env, ["A", "MISSING"])).toEqual([]);
  });
});

describe("chainResolvable", () => {
  it("returns true if at least one key resolves", () => {
    const env = { B: "value" };
    expect(chainResolvable(env, ["A", "B"])).toBe(true);
  });

  it("returns false if no key resolves", () => {
    const env = { A: "", B: undefined };
    expect(chainResolvable(env, ["A", "B"])).toBe(false);
  });
});
