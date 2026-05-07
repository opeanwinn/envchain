import { describe, it, expect } from "vitest";
import { redactValue, redactEnv, redactEnvByPattern } from "./envRedact";

describe("redactValue", () => {
  it("returns [REDACTED] by default for any value", () => {
    expect(redactValue("supersecret")).toBe("[REDACTED]");
  });

  it("returns empty string unchanged", () => {
    expect(redactValue("")).toBe("");
  });

  it("uses custom placeholder in full mode", () => {
    expect(redactValue("abc", { mode: "full", placeholder: "***" })).toBe("***");
  });

  it("partial mode shows last N chars", () => {
    expect(redactValue("abcdefgh", { mode: "partial", visibleChars: 3 })).toBe("*****fgh");
  });

  it("partial mode returns placeholder when value too short", () => {
    expect(redactValue("ab", { mode: "partial", visibleChars: 4 })).toBe("[REDACTED]");
  });

  it("partial mode defaults to 4 visible chars", () => {
    const result = redactValue("my-secret-key", { mode: "partial" });
    expect(result).toMatch(/^\*+key$/);
  });

  it("hash mode returns consistent hash for same value", () => {
    const a = redactValue("secret", { mode: "hash" });
    const b = redactValue("secret", { mode: "hash" });
    expect(a).toBe(b);
    expect(a).toMatch(/^\[REDACTED:[0-9a-f]{8}\]$/);
  });

  it("hash mode returns different hashes for different values", () => {
    const a = redactValue("secret1", { mode: "hash" });
    const b = redactValue("secret2", { mode: "hash" });
    expect(a).not.toBe(b);
  });
});

describe("redactEnv", () => {
  const env = { API_KEY: "abc123", DB_URL: "postgres://localhost", PORT: "3000" };

  it("redacts specified keys", () => {
    const result = redactEnv(env, ["API_KEY", "DB_URL"]);
    expect(result.API_KEY).toBe("[REDACTED]");
    expect(result.DB_URL).toBe("[REDACTED]");
    expect(result.PORT).toBe("3000");
  });

  it("leaves unmatched keys unchanged", () => {
    const result = redactEnv(env, []);
    expect(result).toEqual(env);
  });

  it("passes options to redactValue", () => {
    const result = redactEnv(env, ["API_KEY"], { mode: "partial", visibleChars: 3 });
    expect(result.API_KEY).toBe("***123");
  });
});

describe("redactEnvByPattern", () => {
  const env = { SECRET_KEY: "s3cr3t", API_SECRET: "topsecret", PORT: "8080", HOST: "localhost" };

  it("redacts keys matching pattern", () => {
    const result = redactEnvByPattern(env, /SECRET/);
    expect(result.SECRET_KEY).toBe("[REDACTED]");
    expect(result.API_SECRET).toBe("[REDACTED]");
    expect(result.PORT).toBe("8080");
    expect(result.HOST).toBe("localhost");
  });

  it("supports case-insensitive patterns", () => {
    const env2 = { secret_token: "abc", TOKEN: "xyz" };
    const result = redactEnvByPattern(env2, /secret/i);
    expect(result.secret_token).toBe("[REDACTED]");
    expect(result.TOKEN).toBe("xyz");
  });

  it("returns unchanged env when no keys match", () => {
    const result = redactEnvByPattern(env, /^NONEXISTENT/);
    expect(result).toEqual(env);
  });
});
