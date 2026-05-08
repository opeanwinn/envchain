import {
  createTtlRegistry,
  setWithTtl,
  getWithTtl,
  isExpiredTtl,
  evictExpired,
  snapshotTtlRegistry,
  clearTtlRegistry,
} from "./envTtl";

describe("createTtlRegistry", () => {
  it("creates an empty registry", () => {
    const registry = createTtlRegistry();
    expect(registry.entries.size).toBe(0);
  });
});

describe("setWithTtl / getWithTtl", () => {
  it("stores and retrieves a value within TTL", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "PORT", "3000", 10_000);
    expect(getWithTtl(registry, "PORT")).toBe("3000");
  });

  it("returns undefined for unknown key", () => {
    const registry = createTtlRegistry();
    expect(getWithTtl(registry, "MISSING")).toBeUndefined();
  });

  it("returns undefined and removes entry after TTL expires", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "TOKEN", "abc", -1);
    expect(getWithTtl(registry, "TOKEN")).toBeUndefined();
    expect(registry.entries.has("TOKEN")).toBe(false);
  });
});

describe("isExpiredTtl", () => {
  it("returns false for a live entry", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "KEY", "val", 10_000);
    expect(isExpiredTtl(registry, "KEY")).toBe(false);
  });

  it("returns true for an expired entry", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "KEY", "val", -1);
    expect(isExpiredTtl(registry, "KEY")).toBe(true);
  });

  it("returns true for a missing key", () => {
    const registry = createTtlRegistry();
    expect(isExpiredTtl(registry, "NONE")).toBe(true);
  });
});

describe("evictExpired", () => {
  it("removes expired entries and returns their keys", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "A", "1", -1);
    setWithTtl(registry, "B", "2", 10_000);
    const evicted = evictExpired(registry);
    expect(evicted).toContain("A");
    expect(evicted).not.toContain("B");
    expect(registry.entries.has("A")).toBe(false);
    expect(registry.entries.has("B")).toBe(true);
  });
});

describe("snapshotTtlRegistry", () => {
  it("returns only live entries as a plain object", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "LIVE", "yes", 10_000);
    setWithTtl(registry, "DEAD", "no", -1);
    const snap = snapshotTtlRegistry(registry);
    expect(snap["LIVE"]).toBe("yes");
    expect(snap["DEAD"]).toBeUndefined();
  });
});

describe("clearTtlRegistry", () => {
  it("removes all entries", () => {
    const registry = createTtlRegistry();
    setWithTtl(registry, "X", "1", 10_000);
    clearTtlRegistry(registry);
    expect(registry.entries.size).toBe(0);
  });
});
