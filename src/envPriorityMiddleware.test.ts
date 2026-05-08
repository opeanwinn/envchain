import {
  createPriorityMiddleware,
  createRegistryMiddleware,
  composePriorityMiddlewares,
} from "./envPriorityMiddleware";
import { createPriorityRegistry } from "./envPriority";

describe("createPriorityMiddleware", () => {
  it("merges sources with incoming env at default priority 0", () => {
    const mw = createPriorityMiddleware([
      { name: "defaults", source: { PORT: "3000", HOST: "localhost" }, priority: 1 },
    ]);
    const result = mw({ PORT: "8080" });
    // defaults has priority 1 > incoming 0, so PORT from defaults wins
    expect(result["PORT"]).toBe("3000");
    expect(result["HOST"]).toBe("localhost");
  });

  it("lets incoming env win when overrideIncoming is false and incoming has higher priority", () => {
    const mw = createPriorityMiddleware(
      [{ name: "base", source: { KEY: "base" }, priority: -5 }],
      false
    );
    const result = mw({ KEY: "incoming" });
    expect(result["KEY"]).toBe("incoming");
  });

  it("overrides incoming env when overrideIncoming is true", () => {
    const mw = createPriorityMiddleware(
      [{ name: "override", source: { KEY: "override" }, priority: 1 }],
      true
    );
    const result = mw({ KEY: "incoming" });
    expect(result["KEY"]).toBe("override");
  });

  it("adds new keys from sources to incoming env", () => {
    const mw = createPriorityMiddleware([
      { name: "extra", source: { NEW_KEY: "new" }, priority: 1 },
    ]);
    const result = mw({ EXISTING: "yes" });
    expect(result["NEW_KEY"]).toBe("new");
    expect(result["EXISTING"]).toBe("yes");
  });
});

describe("createRegistryMiddleware", () => {
  it("merges registry sources with incoming env", () => {
    const registry = createPriorityRegistry();
    registry.register("base", { A: "1", B: "2" }, 1);
    const mw = createRegistryMiddleware(registry, 5);
    const result = mw({ A: "incoming" });
    // incoming has priority 5 > base 1, so incoming wins for A
    expect(result["A"]).toBe("incoming");
    expect(result["B"]).toBe("2");
  });

  it("uses registry value when incoming priority is lower", () => {
    const registry = createPriorityRegistry();
    registry.register("high", { X: "registry" }, 10);
    const mw = createRegistryMiddleware(registry, 1);
    const result = mw({ X: "incoming" });
    expect(result["X"]).toBe("registry");
  });
});

describe("composePriorityMiddlewares", () => {
  it("applies middlewares left to right", () => {
    const mw1 = createPriorityMiddleware([
      { name: "a", source: { STEP: "mw1" }, priority: 1 },
    ]);
    const mw2 = createPriorityMiddleware([
      { name: "b", source: { STEP: "mw2" }, priority: 10 },
    ]);
    const composed = composePriorityMiddlewares(mw1, mw2);
    const result = composed({});
    expect(result["STEP"]).toBe("mw2");
  });

  it("passes through env unchanged with no middlewares", () => {
    const composed = composePriorityMiddlewares();
    const result = composed({ FOO: "bar" });
    expect(result).toEqual({ FOO: "bar" });
  });
});
