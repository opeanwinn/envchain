import { createWatchMiddleware, applyWatchMiddleware } from "./envWatchMiddleware";
import { createWatchRegistry } from "./envWatch";

describe("createWatchMiddleware", () => {
  it("should return middleware, watch, watchAll, and clear", () => {
    const wm = createWatchMiddleware();
    expect(typeof wm.middleware).toBe("function");
    expect(typeof wm.watch).toBe("function");
    expect(typeof wm.watchAll).toBe("function");
    expect(typeof wm.clear).toBe("function");
  });

  it("should pass through the env unchanged", () => {
    const wm = createWatchMiddleware();
    const env = { PORT: "3000", HOST: "localhost" };
    const result = wm.middleware(env);
    expect(result).toEqual(env);
  });

  it("should notify watchers when a key changes", () => {
    const wm = createWatchMiddleware();
    const cb = jest.fn();
    wm.watch("PORT", cb);
    wm.middleware({ PORT: "3000" });
    wm.middleware({ PORT: "4000" });
    expect(cb).toHaveBeenCalledWith("PORT", "3000", "4000");
  });

  it("should not notify when env is unchanged between calls", () => {
    const wm = createWatchMiddleware();
    const cb = jest.fn();
    wm.watch("PORT", cb);
    wm.middleware({ PORT: "3000" });
    cb.mockClear();
    wm.middleware({ PORT: "3000" });
    expect(cb).not.toHaveBeenCalled();
  });

  it("should notify watchAll on any change", () => {
    const wm = createWatchMiddleware();
    const cb = jest.fn();
    wm.watchAll(cb);
    wm.middleware({ A: "1" });
    wm.middleware({ A: "2", B: "3" });
    // A changed, B added
    expect(cb).toHaveBeenCalledTimes(3); // initial A added + A changed + B added
  });

  it("should stop notifying after unwatch", () => {
    const wm = createWatchMiddleware();
    const cb = jest.fn();
    const watcher = wm.watch("PORT", cb);
    wm.middleware({ PORT: "3000" });
    watcher.unwatch();
    wm.middleware({ PORT: "9000" });
    expect(cb).toHaveBeenCalledTimes(1); // only initial add
  });

  it("should clear all watchers", () => {
    const wm = createWatchMiddleware();
    const cb = jest.fn();
    wm.watch("X", cb);
    wm.clear();
    wm.middleware({ X: "hello" });
    expect(cb).not.toHaveBeenCalled();
  });
});

describe("applyWatchMiddleware", () => {
  it("should notify via the provided registry context", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watch("DB_URL", cb);
    let snapshot: Record<string, string | undefined> = {};
    const context = {
      registry,
      getPrevious: () => snapshot,
    };
    const env = { DB_URL: "postgres://localhost/mydb" };
    applyWatchMiddleware(env, context);
    expect(cb).toHaveBeenCalledWith("DB_URL", undefined, "postgres://localhost/mydb");
  });

  it("should return the env unchanged", () => {
    const registry = createWatchRegistry();
    const context = { registry, getPrevious: () => ({}) };
    const env = { KEY: "val" };
    const result = applyWatchMiddleware(env, context);
    expect(result).toEqual(env);
  });
});
