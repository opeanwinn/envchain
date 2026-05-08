import {
  createSecretRegistry,
  markSecret,
  isSecret,
  detectSecretKeys,
  buildSecretRegistry,
  listSecretKeys,
  applySecretPolicy,
} from "./envSecret";

describe("createSecretRegistry", () => {
  it("returns an empty map", () => {
    const reg = createSecretRegistry();
    expect(reg.size).toBe(0);
  });
});

describe("markSecret", () => {
  it("adds a key with default masked=true", () => {
    const reg = markSecret(createSecretRegistry(), "API_KEY");
    expect(reg.get("API_KEY")).toEqual({ key: "API_KEY", masked: true, redacted: false });
  });

  it("respects redacted option", () => {
    const reg = markSecret(createSecretRegistry(), "DB_PASS", { redacted: true });
    expect(reg.get("DB_PASS")?.redacted).toBe(true);
  });

  it("does not mutate the original registry", () => {
    const original = createSecretRegistry();
    markSecret(original, "TOKEN");
    expect(original.size).toBe(0);
  });
});

describe("isSecret", () => {
  it("returns true for registered keys", () => {
    const reg = markSecret(createSecretRegistry(), "SECRET_KEY");
    expect(isSecret(reg, "SECRET_KEY")).toBe(true);
  });

  it("returns false for unregistered keys", () => {
    const reg = createSecretRegistry();
    expect(isSecret(reg, "UNKNOWN")).toBe(false);
  });
});

describe("detectSecretKeys", () => {
  it("detects keys matching secret patterns", () => {
    const env = {
      API_KEY: "abc",
      DB_PASSWORD: "secret",
      APP_NAME: "myapp",
      AUTH_TOKEN: "tok",
    };
    const keys = detectSecretKeys(env);
    expect(keys).toContain("API_KEY");
    expect(keys).toContain("DB_PASSWORD");
    expect(keys).toContain("AUTH_TOKEN");
    expect(keys).not.toContain("APP_NAME");
  });
});

describe("buildSecretRegistry", () => {
  it("auto-detects and includes extra keys", () => {
    const env = { DB_SECRET: "x", PORT: "3000" };
    const reg = buildSecretRegistry(env, ["PORT"]);
    expect(isSecret(reg, "DB_SECRET")).toBe(true);
    expect(isSecret(reg, "PORT")).toBe(true);
  });
});

describe("listSecretKeys", () => {
  it("returns all registered secret keys", () => {
    let reg = createSecretRegistry();
    reg = markSecret(reg, "A");
    reg = markSecret(reg, "B");
    expect(listSecretKeys(reg).sort()).toEqual(["A", "B"]);
  });
});

describe("applySecretPolicy", () => {
  it("masks values for masked secrets", () => {
    const reg = markSecret(createSecretRegistry(), "TOKEN", { masked: true });
    const result = applySecretPolicy({ TOKEN: "my-token", PORT: "3000" }, reg);
    expect(result["TOKEN"]).toBe("***");
    expect(result["PORT"]).toBe("3000");
  });

  it("redacts values for redacted secrets", () => {
    const reg = markSecret(createSecretRegistry(), "PASS", { masked: false, redacted: true });
    const result = applySecretPolicy({ PASS: "hunter2" }, reg);
    expect(result["PASS"]).toBe("[REDACTED]");
  });

  it("uses custom mask character", () => {
    const reg = markSecret(createSecretRegistry(), "KEY");
    const result = applySecretPolicy({ KEY: "value" }, reg, "[HIDDEN]");
    expect(result["KEY"]).toBe("[HIDDEN]");
  });
});
