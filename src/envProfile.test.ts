import {
  createProfileRegistry,
  defineProfile,
  getProfile,
  listProfiles,
  activateProfile,
  removeProfile,
  diffProfiles,
} from "./envProfile";
import {
  createProfileMiddleware,
  createDynamicProfileMiddleware,
  composeProfileMiddlewares,
} from "./envProfileMiddleware";

describe("envProfile", () => {
  it("defines and retrieves a profile", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "dev", { API_URL: "http://localhost:3000" });
    const profile = getProfile(registry, "dev");
    expect(profile).toBeDefined();
    expect(profile!.name).toBe("dev");
    expect(profile!.env.API_URL).toBe("http://localhost:3000");
  });

  it("lists all profile names", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "dev", {});
    defineProfile(registry, "prod", {});
    expect(listProfiles(registry)).toEqual(["dev", "prod"]);
  });

  it("activates a profile and returns a copy of its env", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "test", { LOG_LEVEL: "silent" });
    const env = activateProfile(registry, "test");
    expect(env.LOG_LEVEL).toBe("silent");
  });

  it("throws when activating an undefined profile", () => {
    const registry = createProfileRegistry();
    expect(() => activateProfile(registry, "ghost")).toThrow(/Profile "ghost"/);
  });

  it("removes a profile", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "tmp", {});
    expect(removeProfile(registry, "tmp")).toBe(true);
    expect(getProfile(registry, "tmp")).toBeUndefined();
  });

  it("diffs two profiles", () => {
    const registry = createProfileRegistry();
    const a = defineProfile(registry, "a", { X: "1", Y: "2" });
    const b = defineProfile(registry, "b", { X: "1", Y: "3", Z: "4" });
    const diff = diffProfiles(a, b);
    expect(diff["Y"]).toEqual({ from: "2", to: "3" });
    expect(diff["Z"]).toEqual({ from: undefined, to: "4" });
    expect(diff["X"]).toBeUndefined();
  });
});

describe("envProfileMiddleware", () => {
  it("merges profile without overriding existing keys by default", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "base", { A: "profile", B: "profile" });
    const mw = createProfileMiddleware(registry, "base");
    const result = mw({ A: "existing" });
    expect(result.A).toBe("existing");
    expect(result.B).toBe("profile");
  });

  it("overrides existing keys when option is set", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "strict", { A: "profile" });
    const mw = createProfileMiddleware(registry, "strict", { override: true });
    const result = mw({ A: "existing" });
    expect(result.A).toBe("profile");
  });

  it("dynamically selects profile from discriminator key", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "production", { LOG_LEVEL: "error" });
    const mw = createDynamicProfileMiddleware(registry, "NODE_ENV");
    const result = mw({ NODE_ENV: "production", LOG_LEVEL: "debug" });
    // default: profile does not override existing
    expect(result.LOG_LEVEL).toBe("debug");
  });

  it("passes through when discriminator profile is not defined", () => {
    const registry = createProfileRegistry();
    const mw = createDynamicProfileMiddleware(registry, "NODE_ENV");
    const env = { NODE_ENV: "staging", FOO: "bar" };
    expect(mw(env)).toEqual(env);
  });

  it("composes multiple profile middlewares", () => {
    const registry = createProfileRegistry();
    defineProfile(registry, "base", { A: "base" });
    defineProfile(registry, "extra", { B: "extra" });
    const composed = composeProfileMiddlewares(
      createProfileMiddleware(registry, "base"),
      createProfileMiddleware(registry, "extra")
    );
    const result = composed({});
    expect(result.A).toBe("base");
    expect(result.B).toBe("extra");
  });
});
