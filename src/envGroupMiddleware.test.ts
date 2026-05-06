import { describe, it, expect } from "vitest";
import {
  createGroupMiddleware,
  validateGroupKeys,
  flattenGroupEnv,
} from "./envGroupMiddleware";
import { createEnvGroup } from "./envGroup";

const dbGroup = createEnvGroup("DB_", (s) => ({
  host: s["HOST"] ?? "",
  port: s["PORT"] ?? "",
}));

describe("createGroupMiddleware", () => {
  it("passes through all original keys", () => {
    const mw = createGroupMiddleware([dbGroup as any]);
    const env = { DB_HOST: "localhost", APP_NAME: "test" };
    const result = mw(env);
    expect(result["APP_NAME"]).toBe("test");
    expect(result["DB_HOST"]).toBe("localhost");
  });

  it("does not overwrite existing composite keys", () => {
    const mw = createGroupMiddleware([dbGroup as any]);
    const env = { DB_HOST: "original" };
    const result = mw(env);
    expect(result["DB_HOST"]).toBe("original");
  });

  it("handles empty env", () => {
    const mw = createGroupMiddleware([dbGroup as any]);
    expect(mw({})).toEqual({});
  });

  it("handles multiple groups without conflict", () => {
    const appGroup = createEnvGroup("APP_", (s) => ({ name: s["NAME"] ?? "" }));
    const mw = createGroupMiddleware([dbGroup as any, appGroup as any]);
    const env = { DB_HOST: "db", APP_NAME: "myapp" };
    const result = mw(env);
    expect(result["DB_HOST"]).toBe("db");
    expect(result["APP_NAME"]).toBe("myapp");
  });
});

describe("validateGroupKeys", () => {
  it("returns empty array when all keys present", () => {
    const env = { DB_HOST: "localhost", DB_PORT: "5432" };
    const missing = validateGroupKeys(dbGroup as any, ["HOST", "PORT"], env);
    expect(missing).toEqual([]);
  });

  it("returns missing key paths", () => {
    const env = { DB_HOST: "localhost" };
    const missing = validateGroupKeys(dbGroup as any, ["HOST", "PORT"], env);
    expect(missing).toContain("DB_PORT");
  });

  it("treats empty string as missing", () => {
    const env = { DB_HOST: "" };
    const missing = validateGroupKeys(dbGroup as any, ["HOST"], env);
    expect(missing).toContain("DB_HOST");
  });
});

describe("flattenGroupEnv", () => {
  it("prepends prefix to all keys", () => {
    const result = flattenGroupEnv("DB_", { HOST: "localhost", PORT: "5432" });
    expect(result).toEqual({ DB_HOST: "localhost", DB_PORT: "5432" });
  });

  it("returns empty object for empty input", () => {
    expect(flattenGroupEnv("DB_", {})).toEqual({});
  });

  it("preserves undefined values", () => {
    const result = flattenGroupEnv("DB_", { HOST: undefined });
    expect(result["DB_HOST"]).toBeUndefined();
  });
});
