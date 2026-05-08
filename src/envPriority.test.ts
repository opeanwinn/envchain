import {
  sortByPriority,
  resolveFromSources,
  mergePrioritySources,
  createPriorityRegistry,
  PriorityEntry,
} from "./envPriority";

describe("sortByPriority", () => {
  it("sorts entries from highest to lowest priority", () => {
    const entries: PriorityEntry[] = [
      { name: "low", source: {}, priority: 1 },
      { name: "high", source: {}, priority: 10 },
      { name: "mid", source: {}, priority: 5 },
    ];
    const sorted = sortByPriority(entries);
    expect(sorted.map((e) => e.name)).toEqual(["high", "mid", "low"]);
  });

  it("does not mutate the original array", () => {
    const entries: PriorityEntry[] = [
      { name: "a", source: {}, priority: 1 },
      { name: "b", source: {}, priority: 2 },
    ];
    sortByPriority(entries);
    expect(entries[0].name).toBe("a");
  });
});

describe("resolveFromSources", () => {
  const entries: PriorityEntry[] = [
    { name: "defaults", source: { PORT: "3000", HOST: "localhost" }, priority: 1 },
    { name: "env", source: { PORT: "8080" }, priority: 5 },
    { name: "override", source: { PORT: "9090" }, priority: 10 },
  ];

  it("returns value from highest priority source", () => {
    const result = resolveFromSources("PORT", entries);
    expect(result.value).toBe("9090");
    expect(result.sourceName).toBe("override");
  });

  it("falls back to lower priority when key is missing in higher", () => {
    const result = resolveFromSources("HOST", entries);
    expect(result.value).toBe("localhost");
    expect(result.sourceName).toBe("defaults");
  });

  it("returns undefined when key is not found in any source", () => {
    const result = resolveFromSources("MISSING", entries);
    expect(result.value).toBeUndefined();
    expect(result.sourceName).toBeUndefined();
  });
});

describe("mergePrioritySources", () => {
  it("merges sources with higher priority winning", () => {
    const entries: PriorityEntry[] = [
      { name: "defaults", source: { A: "1", B: "2" }, priority: 1 },
      { name: "env", source: { A: "10", C: "3" }, priority: 5 },
    ];
    const merged = mergePrioritySources(entries);
    expect(merged).toEqual({ A: "10", B: "2", C: "3" });
  });

  it("ignores undefined values", () => {
    const entries: PriorityEntry[] = [
      { name: "a", source: { X: undefined }, priority: 10 },
      { name: "b", source: { X: "val" }, priority: 1 },
    ];
    const merged = mergePrioritySources(entries);
    expect(merged["X"]).toBe("val");
  });
});

describe("createPriorityRegistry", () => {
  it("registers sources and resolves keys", () => {
    const registry = createPriorityRegistry();
    registry.register("base", { DB_URL: "postgres://localhost" }, 1);
    registry.register("env", { DB_URL: "postgres://prod" }, 10);
    const result = registry.resolve("DB_URL");
    expect(result.value).toBe("postgres://prod");
  });

  it("merges all sources", () => {
    const registry = createPriorityRegistry();
    registry.register("a", { FOO: "a" }, 1);
    registry.register("b", { BAR: "b" }, 2);
    expect(registry.merge()).toEqual({ FOO: "a", BAR: "b" });
  });

  it("lists entries sorted by priority", () => {
    const registry = createPriorityRegistry();
    registry.register("low", {}, 1);
    registry.register("high", {}, 99);
    const list = registry.list();
    expect(list[0].name).toBe("high");
  });

  it("clears all entries", () => {
    const registry = createPriorityRegistry();
    registry.register("a", { K: "v" }, 1);
    registry.clear();
    expect(registry.merge()).toEqual({});
  });
});
