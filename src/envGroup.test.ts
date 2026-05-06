import { describe, it, expect } from "vitest";
import {
  createEnvGroup,
  extractPrefixed,
  mergeEnvGroups,
} from "./envGroup";

describe("extractPrefixed", () => {
  it("extracts keys matching the prefix", () => {
    const env = { DB_HOST: "localhost", DB_PORT: "5432", APP_NAME: "test" };
    const result = extractPrefixed("DB_", env);
    expect(result).toEqual({ HOST: "localhost", PORT: "5432" });
  });

  it("returns empty object when no keys match", () => {
    const env = { APP_NAME: "test" };
    expect(extractPrefixed("DB_", env)).toEqual({});
  });

  it("is case-insensitive for prefix matching", () => {
    const env = { db_host: "localhost" };
    const result = extractPrefixed("DB_", env);
    expect(result["host"]).toBe("localhost");
  });

  it("strips leading underscore from stripped key", () => {
    const env = { DB_HOST: "localhost" };
    const result = extractPrefixed("DB", env);
    expect(result["HOST"]).toBe("localhost");
  });
});

describe("createEnvGroup", () => {
  it("resolves scoped env variables", () => {
    const group = createEnvGroup("DB_", (scoped) => ({
      host: scoped["HOST"] ?? "",
      port: Number(scoped["PORT"] ?? 0),
    }));

    const env = { DB_HOST: "localhost", DB_PORT: "5432", APP_NAME: "test" };
    const result = group.resolve(env);
    expect(result).toEqual({ host: "localhost", port: 5432 });
  });

  it("returns defaults when no matching keys", () => {
    const group = createEnvGroup("DB_", (scoped) => ({
      host: scoped["HOST"] ?? "default-host",
    }));
    expect(group.resolve({})).toEqual({ host: "default-host" });
  });
});

describe("mergeEnvGroups", () => {
  it("merges multiple groups into a namespaced record", () => {
    const dbGroup = createEnvGroup("DB_", (s) => ({ host: s["HOST"] ?? "" }));
    const appGroup = createEnvGroup("APP_", (s) => ({ name: s["NAME"] ?? "" }));

    const env = { DB_HOST: "localhost", APP_NAME: "myapp" };
    const merged = mergeEnvGroups(
      [dbGroup as any, appGroup as any],
      env
    );

    expect(merged["DB_"]).toEqual({ host: "localhost" });
    expect(merged["APP_"]).toEqual({ name: "myapp" });
  });

  it("handles empty env gracefully", () => {
    const group = createEnvGroup("X_", (s) => ({ val: s["VAL"] ?? "none" }));
    const merged = mergeEnvGroups([group as any], {});
    expect(merged["X_"]).toEqual({ val: "none" });
  });
});
