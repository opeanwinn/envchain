import { describe, it, expect } from "vitest";
import {
  createAliasMiddleware,
  mergeAliasMaps,
  createMergedAliasMiddleware,
} from "./aliasMiddleware";

describe("createAliasMiddleware", () => {
  it("returns a function that resolves aliases in env", () => {
    const middleware = createAliasMiddleware({
      DATABASE_URL: ["DB_URL"],
    });
    const result = middleware({ DB_URL: "postgres://localhost" });
    expect(result["DATABASE_URL"]).toBe("postgres://localhost");
  });

  it("does not alter env when no aliases match", () => {
    const middleware = createAliasMiddleware({ DATABASE_URL: ["DB_URL"] });
    const env = { PORT: "8080" };
    const result = middleware(env);
    expect(result).toEqual({ PORT: "8080" });
  });

  it("preserves canonical key when both alias and canonical are present", () => {
    const middleware = createAliasMiddleware({ DATABASE_URL: ["DB_URL"] });
    const env = { DB_URL: "alias", DATABASE_URL: "canonical" };
    const result = middleware(env);
    expect(result["DATABASE_URL"]).toBe("canonical");
  });

  it("does not mutate the original env object", () => {
    const middleware = createAliasMiddleware({ DATABASE_URL: ["DB_URL"] });
    const env = { DB_URL: "postgres://localhost" };
    middleware(env);
    expect(env["DATABASE_URL" as keyof typeof env]).toBeUndefined();
  });
});

describe("mergeAliasMaps", () => {
  it("merges two alias maps with distinct canonicals", () => {
    const merged = mergeAliasMaps(
      { DATABASE_URL: ["DB_URL"] },
      { REDIS_URL: ["CACHE_URL"] }
    );
    expect(merged["DATABASE_URL"]).toEqual(["DB_URL"]);
    expect(merged["REDIS_URL"]).toEqual(["CACHE_URL"]);
  });

  it("merges alias lists for the same canonical key", () => {
    const merged = mergeAliasMaps(
      { DATABASE_URL: ["DB_URL"] },
      { DATABASE_URL: ["POSTGRES_URL"] }
    );
    expect(merged["DATABASE_URL"]).toEqual(["DB_URL", "POSTGRES_URL"]);
  });

  it("returns empty map when no maps provided", () => {
    expect(mergeAliasMaps()).toEqual({});
  });

  it("handles a single map without modification", () => {
    const map = { PORT: ["APP_PORT"] };
    expect(mergeAliasMaps(map)).toEqual({ PORT: ["APP_PORT"] });
  });
});

describe("createMergedAliasMiddleware", () => {
  it("creates a middleware from multiple alias maps", () => {
    const middleware = createMergedAliasMiddleware(
      { DATABASE_URL: ["DB_URL"] },
      { REDIS_URL: ["CACHE_URL"] }
    );
    const env = { DB_URL: "postgres://localhost", CACHE_URL: "redis://localhost" };
    const result = middleware(env);
    expect(result["DATABASE_URL"]).toBe("postgres://localhost");
    expect(result["REDIS_URL"]).toBe("redis://localhost");
  });

  it("resolves merged aliases for the same canonical", () => {
    const middleware = createMergedAliasMiddleware(
      { DATABASE_URL: ["DB_URL"] },
      { DATABASE_URL: ["POSTGRES_URL"] }
    );
    const env = { POSTGRES_URL: "postgres://prod" };
    const result = middleware(env);
    expect(result["DATABASE_URL"]).toBe("postgres://prod");
  });
});
