import {
  scopeByPrefix,
  scopeByKeys,
  unscopeWithPrefix,
  createScopeRegistry,
} from "./envScope";

describe("scopeByPrefix", () => {
  const env = {
    APP_HOST: "localhost",
    APP_PORT: "3000",
    DB_HOST: "db.local",
    DB_PORT: "5432",
  };

  it("returns only keys matching the prefix", () => {
    const scoped = scopeByPrefix(env, "APP_");
    expect(scoped).toEqual({ APP_HOST: "localhost", APP_PORT: "3000" });
  });

  it("strips prefix when stripPrefix is true", () => {
    const scoped = scopeByPrefix(env, "APP_", { stripPrefix: true });
    expect(scoped).toEqual({ HOST: "localhost", PORT: "3000" });
  });

  it("returns empty object when no keys match", () => {
    const scoped = scopeByPrefix(env, "REDIS_");
    expect(scoped).toEqual({});
  });
});

describe("scopeByKeys", () => {
  const env = { FOO: "foo", BAR: "bar", BAZ: "baz" };

  it("returns only the specified keys", () => {
    expect(scopeByKeys(env, ["FOO", "BAZ"])).toEqual({ FOO: "foo", BAZ: "baz" });
  });

  it("ignores keys not present in env", () => {
    expect(scopeByKeys(env, ["FOO", "MISSING"])).toEqual({ FOO: "foo" });
  });

  it("returns empty object for empty key list", () => {
    expect(scopeByKeys(env, [])).toEqual({});
  });
});

describe("unscopeWithPrefix", () => {
  it("re-adds prefix to all keys", () => {
    const scoped = { HOST: "localhost", PORT: "3000" };
    expect(unscopeWithPrefix(scoped, "APP_")).toEqual({
      APP_HOST: "localhost",
      APP_PORT: "3000",
    });
  });

  it("returns empty object for empty scoped map", () => {
    expect(unscopeWithPrefix({}, "APP_")).toEqual({});
  });
});

describe("createScopeRegistry", () => {
  it("defines and retrieves a scope", () => {
    const registry = createScopeRegistry();
    registry.define("app", { APP_HOST: "localhost" });
    expect(registry.get("app")).toEqual({ APP_HOST: "localhost" });
  });

  it("has returns correct boolean", () => {
    const registry = createScopeRegistry();
    registry.define("db", { DB_URL: "postgres://" });
    expect(registry.has("db")).toBe(true);
    expect(registry.has("cache")).toBe(false);
  });

  it("list returns all scope names", () => {
    const registry = createScopeRegistry();
    registry.define("a", {});
    registry.define("b", {});
    expect(registry.list()).toEqual(["a", "b"]);
  });

  it("merge combines existing and new entries", () => {
    const registry = createScopeRegistry();
    registry.define("app", { HOST: "localhost" });
    registry.merge("app", { PORT: "8080" });
    expect(registry.get("app")).toEqual({ HOST: "localhost", PORT: "8080" });
  });

  it("delete removes a scope", () => {
    const registry = createScopeRegistry();
    registry.define("temp", { KEY: "val" });
    expect(registry.delete("temp")).toBe(true);
    expect(registry.has("temp")).toBe(false);
  });
});
