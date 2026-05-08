/**
 * Integration tests for envPriority + envPriorityMiddleware
 * simulating real-world layered config scenarios.
 */

import { createPriorityRegistry } from "./envPriority";
import {
  createPriorityMiddleware,
  createRegistryMiddleware,
  composePriorityMiddlewares,
} from "./envPriorityMiddleware";

describe("layered config resolution (integration)", () => {
  const hardcodedDefaults = { PORT: "3000", LOG_LEVEL: "info", DEBUG: "false" };
  const dotenvValues = { PORT: "4000", DB_URL: "postgres://localhost/dev" };
  const processEnv = { PORT: "8080", SECRET: "s3cr3t" };

  it("resolves a full config stack with correct priority", () => {
    const mw = createPriorityMiddleware([
      { name: "hardcoded", source: hardcodedDefaults, priority: 1 },
      { name: "dotenv", source: dotenvValues, priority: 5 },
      { name: "process.env", source: processEnv, priority: 10 },
    ]);

    const result = mw({});
    // process.env wins for PORT
    expect(result["PORT"]).toBe("8080");
    // dotenv wins for DB_URL (not in process.env)
    expect(result["DB_URL"]).toBe("postgres://localhost/dev");
    // hardcoded wins for LOG_LEVEL (not overridden)
    expect(result["LOG_LEVEL"]).toBe("info");
    // process.env provides SECRET
    expect(result["SECRET"]).toBe("s3cr3t");
  });

  it("registry-based approach produces the same result", () => {
    const registry = createPriorityRegistry();
    registry.register("hardcoded", hardcodedDefaults, 1);
    registry.register("dotenv", dotenvValues, 5);

    const mw = createRegistryMiddleware(registry, 10);
    const result = mw(processEnv);

    expect(result["PORT"]).toBe("8080");
    expect(result["DB_URL"]).toBe("postgres://localhost/dev");
    expect(result["LOG_LEVEL"]).toBe("info");
  });

  it("composed middlewares allow staged enrichment", () => {
    const stage1 = createPriorityMiddleware([
      { name: "defaults", source: hardcodedDefaults, priority: 1 },
    ]);
    const stage2 = createPriorityMiddleware([
      { name: "runtime", source: processEnv, priority: 10 },
    ]);

    const pipeline = composePriorityMiddlewares(stage1, stage2);
    const result = pipeline({});

    expect(result["PORT"]).toBe("8080");
    expect(result["LOG_LEVEL"]).toBe("info");
    expect(result["SECRET"]).toBe("s3cr3t");
  });

  it("lower priority source does not overwrite already-set keys", () => {
    const registry = createPriorityRegistry();
    registry.register("low", { FEATURE_FLAG: "off" }, 1);
    registry.register("high", { FEATURE_FLAG: "on" }, 100);

    const merged = registry.merge();
    expect(merged["FEATURE_FLAG"]).toBe("on");
  });
});
