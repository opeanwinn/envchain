import {
  createConditionalInjectMiddleware,
  createProfileConditionMiddleware,
  createConditionalKeyMiddleware,
} from "./envConditionMiddleware";
import { whenEquals, whenPresent } from "./envCondition";

describe("createConditionalInjectMiddleware", () => {
  it("injects values when predicate matches", () => {
    const mw = createConditionalInjectMiddleware(
      whenEquals("NODE_ENV", "test"),
      { FEATURE_FLAG: "true" }
    );
    const result = mw({ NODE_ENV: "test" });
    expect(result.FEATURE_FLAG).toBe("true");
    expect(result.NODE_ENV).toBe("test");
  });

  it("does not inject when predicate does not match", () => {
    const mw = createConditionalInjectMiddleware(
      whenEquals("NODE_ENV", "test"),
      { FEATURE_FLAG: "true" }
    );
    const result = mw({ NODE_ENV: "production" });
    expect(result.FEATURE_FLAG).toBeUndefined();
  });

  it("replaces env entirely when merge is false", () => {
    const mw = createConditionalInjectMiddleware(
      whenPresent("RESET"),
      { ONLY_KEY: "only" },
      { merge: false }
    );
    const result = mw({ RESET: "1", OTHER: "x" });
    expect(result).toEqual({ ONLY_KEY: "only" });
  });
});

describe("createProfileConditionMiddleware", () => {
  const profiles = {
    production: { API_URL: "https://prod.example.com" },
    staging: { API_URL: "https://staging.example.com" },
  };

  it("merges profile env when profile key matches", () => {
    const mw = createProfileConditionMiddleware("APP_ENV", profiles);
    const result = mw({ APP_ENV: "production", BASE: "keep" });
    expect(result.API_URL).toBe("https://prod.example.com");
    expect(result.BASE).toBe("keep");
  });

  it("returns env unchanged when profile is unknown", () => {
    const mw = createProfileConditionMiddleware("APP_ENV", profiles);
    const result = mw({ APP_ENV: "local" });
    expect(result.API_URL).toBeUndefined();
  });

  it("returns env unchanged when profile key is absent", () => {
    const mw = createProfileConditionMiddleware("APP_ENV", profiles);
    const result = mw({});
    expect(result).toEqual({});
  });
});

describe("createConditionalKeyMiddleware", () => {
  it("resolves key value based on matching rule", () => {
    const mw = createConditionalKeyMiddleware("API_URL", [
      { predicate: whenEquals("NODE_ENV", "production"), resolve: () => "https://prod.api" },
      { predicate: whenEquals("NODE_ENV", "staging"), resolve: () => "https://staging.api" },
    ], "http://localhost:3000");

    expect(mw({ NODE_ENV: "production" }).API_URL).toBe("https://prod.api");
    expect(mw({ NODE_ENV: "staging" }).API_URL).toBe("https://staging.api");
    expect(mw({ NODE_ENV: "development" }).API_URL).toBe("http://localhost:3000");
  });
});
