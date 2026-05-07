import { createEnvCache } from "./envCache";

type TestEnv = {
  PORT: number;
  HOST: string;
  DEBUG: boolean;
};

describe("createEnvCache", () => {
  it("returns undefined for missing keys", () => {
    const cache = createEnvCache<TestEnv>();
    expect(cache.get("PORT")).toBeUndefined();
  });

  it("stores and retrieves values", () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("PORT", 3000);
    expect(cache.get("PORT")).toBe(3000);
  });

  it("has() returns true for existing keys", () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("HOST", "localhost");
    expect(cache.has("HOST")).toBe(true);
    expect(cache.has("PORT")).toBe(false);
  });

  it("invalidate() removes a specific key", () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("PORT", 8080);
    cache.invalidate("PORT");
    expect(cache.get("PORT")).toBeUndefined();
    expect(cache.has("PORT")).toBe(false);
  });

  it("invalidateAll() clears all entries", () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("PORT", 3000);
    cache.set("HOST", "localhost");
    cache.set("DEBUG", true);
    cache.invalidateAll();
    expect(cache.size()).toBe(0);
  });

  it("snapshot() returns all non-expired entries", () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("PORT", 3000);
    cache.set("HOST", "example.com");
    const snap = cache.snapshot();
    expect(snap).toEqual({ PORT: 3000, HOST: "example.com" });
  });

  it("size() reflects number of valid entries", () => {
    const cache = createEnvCache<TestEnv>();
    expect(cache.size()).toBe(0);
    cache.set("PORT", 3000);
    cache.set("HOST", "localhost");
    expect(cache.size()).toBe(2);
  });

  it("entries with ttl expire after the given duration", async () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("PORT", 9000, 50); // 50ms TTL
    expect(cache.get("PORT")).toBe(9000);
    await new Promise((r) => setTimeout(r, 80));
    expect(cache.get("PORT")).toBeUndefined();
  });

  it("has() returns false for expired entries", async () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("DEBUG", true, 30);
    await new Promise((r) => setTimeout(r, 60));
    expect(cache.has("DEBUG")).toBe(false);
  });

  it("expired entries are excluded from snapshot()", async () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("PORT", 1234, 30);
    cache.set("HOST", "stable");
    await new Promise((r) => setTimeout(r, 60));
    const snap = cache.snapshot();
    expect(snap).toEqual({ HOST: "stable" });
  });

  it("null ttl entries never expire", async () => {
    const cache = createEnvCache<TestEnv>();
    cache.set("HOST", "persistent"); // no ttl = null
    await new Promise((r) => setTimeout(r, 50));
    expect(cache.get("HOST")).toBe("persistent");
  });
});
