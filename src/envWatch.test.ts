import { createWatchRegistry, diffAndNotify } from "./envWatch";

describe("createWatchRegistry", () => {
  it("should start with size 0", () => {
    const registry = createWatchRegistry();
    expect(registry.size()).toBe(0);
  });

  it("should register a key-specific watcher", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watch("PORT", cb);
    expect(registry.size()).toBe(1);
  });

  it("should notify key-specific watcher on matching key", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watch("PORT", cb);
    registry.notify("PORT", "3000", "4000");
    expect(cb).toHaveBeenCalledWith("PORT", "3000", "4000");
  });

  it("should not notify key-specific watcher on non-matching key", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watch("PORT", cb);
    registry.notify("HOST", "localhost", "example.com");
    expect(cb).not.toHaveBeenCalled();
  });

  it("should notify watchAll watcher on any key", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watchAll(cb);
    registry.notify("PORT", "3000", "4000");
    registry.notify("HOST", "a", "b");
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("should unwatch and stop receiving notifications", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    const watcher = registry.watch("PORT", cb);
    watcher.unwatch();
    registry.notify("PORT", "3000", "4000");
    expect(cb).not.toHaveBeenCalled();
    expect(registry.size()).toBe(0);
  });

  it("should clear all watchers", () => {
    const registry = createWatchRegistry();
    registry.watch("A", jest.fn());
    registry.watch("B", jest.fn());
    registry.clear();
    expect(registry.size()).toBe(0);
  });
});

describe("diffAndNotify", () => {
  it("should notify for changed keys", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watchAll(cb);
    diffAndNotify(registry, { PORT: "3000" }, { PORT: "4000" });
    expect(cb).toHaveBeenCalledWith("PORT", "3000", "4000");
  });

  it("should notify for added keys", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watchAll(cb);
    diffAndNotify(registry, {}, { NEW_KEY: "value" });
    expect(cb).toHaveBeenCalledWith("NEW_KEY", undefined, "value");
  });

  it("should notify for removed keys", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watchAll(cb);
    diffAndNotify(registry, { OLD_KEY: "val" }, {});
    expect(cb).toHaveBeenCalledWith("OLD_KEY", "val", undefined);
  });

  it("should not notify for unchanged keys", () => {
    const registry = createWatchRegistry();
    const cb = jest.fn();
    registry.watchAll(cb);
    diffAndNotify(registry, { STABLE: "same" }, { STABLE: "same" });
    expect(cb).not.toHaveBeenCalled();
  });
});
