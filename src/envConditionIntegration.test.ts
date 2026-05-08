/**
 * Integration tests: envCondition + envConditionMiddleware working together
 * in a composed middleware pipeline scenario.
 */
import { allOf, whenEquals, whenPresent } from "./envCondition";
import {
  createConditionalInjectMiddleware,
  createProfileConditionMiddleware,
} from "./envConditionMiddleware";

function compose(
  ...middlewares: Array<(env: Record<string, string>) => Record<string, string>>
) {
  return (env: Record<string, string>) =>
    middlewares.reduce((acc, mw) => mw(acc), env);
}

describe("envCondition integration", () => {
  it("applies multiple conditional middlewares in sequence", () => {
    const pipeline = compose(
      createProfileConditionMiddleware("NODE_ENV", {
        production: { LOG_LEVEL: "error", CACHE_TTL: "3600" },
        development: { LOG_LEVEL: "debug", CACHE_TTL: "0" },
      }),
      createConditionalInjectMiddleware(
        allOf(whenEquals("NODE_ENV", "production"), whenPresent("ENABLE_METRICS")),
        { METRICS_ENDPOINT: "https://metrics.prod.example.com" }
      )
    );

    const prodWithMetrics = pipeline({
      NODE_ENV: "production",
      ENABLE_METRICS: "true",
    });
    expect(prodWithMetrics.LOG_LEVEL).toBe("error");
    expect(prodWithMetrics.CACHE_TTL).toBe("3600");
    expect(prodWithMetrics.METRICS_ENDPOINT).toBe("https://metrics.prod.example.com");

    const prodWithoutMetrics = pipeline({ NODE_ENV: "production" });
    expect(prodWithoutMetrics.LOG_LEVEL).toBe("error");
    expect(prodWithoutMetrics.METRICS_ENDPOINT).toBeUndefined();

    const dev = pipeline({ NODE_ENV: "development", ENABLE_METRICS: "true" });
    expect(dev.LOG_LEVEL).toBe("debug");
    expect(dev.METRICS_ENDPOINT).toBeUndefined();
  });

  it("preserves original env keys not overridden by conditions", () => {
    const pipeline = compose(
      createConditionalInjectMiddleware(whenPresent("API_KEY"), { AUTHENTICATED: "true" })
    );
    const result = pipeline({ API_KEY: "secret", APP_NAME: "myapp" });
    expect(result.APP_NAME).toBe("myapp");
    expect(result.AUTHENTICATED).toBe("true");
  });
});
