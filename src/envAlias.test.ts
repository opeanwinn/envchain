import { describe, it, expect } from "vitest";
import {
  buildAliasIndex,
  resolveAlias,
  applyAliases,
  getAliasesFor,
} from "./envAlias";

describe("buildAliasIndex", () => {
  it("builds a reverse lookup from canonical to aliases", () => {
    const index = buildAliasIndex({ DATABASE_URL: ["DB_URL", "POSTGRES_URL"] });
    expect(index["DB_URL"]).toBe("DATABASE_URL");
    expect(index["POSTGRES_URL"]).toBe("DATABASE_URL");
  });

  it("throws on duplicate alias across different canonicals", () => {
    expect(() =>
      buildAliasIndex({
        DATABASE_URL: ["DB_URL"],
        SECONDARY_DB: ["DB_URL"],
      })
    ).toThrow(/Duplicate alias detected/);
  });

  it("returns empty index for empty alias map", () => {
    expect(buildAliasIndex({})).toEqual({});
  });
});

describe("resolveAlias", () => {
  it("returns canonical key when alias is found", () => {
    const index = buildAliasIndex({ DATABASE_URL: ["DB_URL"] });
    expect(resolveAlias("DB_URL", index)).toBe("DATABASE_URL");
  });

  it("returns the original key when no alias is found", () => {
    expect(resolveAlias("UNKNOWN_KEY", {})).toBe("UNKNOWN_KEY");
  });
});

describe("applyAliases", () => {
  it("promotes alias value to canonical key when canonical is absent", () => {
    const env = { DB_URL: "postgres://localhost/mydb" };
    const result = applyAliases(env, { DATABASE_URL: ["DB_URL"] });
    expect(result["DATABASE_URL"]).toBe("postgres://localhost/mydb");
  });

  it("does not overwrite canonical key if already present", () => {
    const env = { DB_URL: "alias-value", DATABASE_URL: "canonical-value" };
    const result = applyAliases(env, { DATABASE_URL: ["DB_URL"] });
    expect(result["DATABASE_URL"]).toBe("canonical-value");
  });

  it("leaves unrelated keys untouched", () => {
    const env = { PORT: "3000" };
    const result = applyAliases(env, { DATABASE_URL: ["DB_URL"] });
    expect(result["PORT"]).toBe("3000");
  });

  it("handles multiple aliases for the same canonical", () => {
    const env = { POSTGRES_URL: "postgres://localhost" };
    const result = applyAliases(env, {
      DATABASE_URL: ["DB_URL", "POSTGRES_URL"],
    });
    expect(result["DATABASE_URL"]).toBe("postgres://localhost");
  });
});

describe("getAliasesFor", () => {
  it("returns aliases for a known canonical key", () => {
    const aliases = { DATABASE_URL: ["DB_URL", "POSTGRES_URL"] };
    expect(getAliasesFor("DATABASE_URL", aliases)).toEqual([
      "DB_URL",
      "POSTGRES_URL",
    ]);
  });

  it("returns empty array for unknown canonical key", () => {
    expect(getAliasesFor("MISSING_KEY", {})).toEqual([]);
  });
});
