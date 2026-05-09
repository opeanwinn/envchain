import { describe, it, expect, beforeEach } from "vitest";
import {
  createTagRegistry,
  filterEnvByTag,
  tagSummary,
  TagRegistry,
} from "./envTagging";

describe("createTagRegistry", () => {
  let registry: TagRegistry;

  beforeEach(() => {
    registry = createTagRegistry();
  });

  it("starts with an empty tag map", () => {
    expect(registry.tags).toEqual({});
  });

  it("adds tags to a key", () => {
    registry.add("DATABASE_URL", "secret", "required");
    expect(registry.get("DATABASE_URL")).toEqual(["secret", "required"]);
  });

  it("does not add duplicate tags", () => {
    registry.add("API_KEY", "secret");
    registry.add("API_KEY", "secret");
    expect(registry.get("API_KEY")).toEqual(["secret"]);
  });

  it("removes a specific tag from a key", () => {
    registry.add("PORT", "optional", "numeric");
    registry.remove("PORT", "optional");
    expect(registry.get("PORT")).toEqual(["numeric"]);
  });

  it("returns empty array for unknown key", () => {
    expect(registry.get("UNKNOWN_KEY")).toEqual([]);
  });

  it("checks if a key has a specific tag", () => {
    registry.add("LOG_LEVEL", "optional");
    expect(registry.has("LOG_LEVEL", "optional")).toBe(true);
    expect(registry.has("LOG_LEVEL", "secret")).toBe(false);
  });

  it("finds all keys with a given tag", () => {
    registry.add("DATABASE_URL", "secret");
    registry.add("API_KEY", "secret");
    registry.add("PORT", "optional");
    const secretKeys = registry.findByTag("secret");
    expect(secretKeys).toContain("DATABASE_URL");
    expect(secretKeys).toContain("API_KEY");
    expect(secretKeys).not.toContain("PORT");
  });

  it("clears tags for a specific key", () => {
    registry.add("HOST", "required");
    registry.clear("HOST");
    expect(registry.get("HOST")).toEqual([]);
  });

  it("resets all tags", () => {
    registry.add("A", "x");
    registry.add("B", "y");
    registry.reset();
    expect(registry.tags).toEqual({});
  });
});

describe("filterEnvByTag", () => {
  it("filters env variables by tag", () => {
    const registry = createTagRegistry();
    registry.add("DATABASE_URL", "secret");
    registry.add("API_KEY", "secret");
    registry.add("PORT", "optional");

    const env = { DATABASE_URL: "postgres://", API_KEY: "abc", PORT: "3000" };
    const result = filterEnvByTag(env, registry, "secret");
    expect(result).toEqual({ DATABASE_URL: "postgres://", API_KEY: "abc" });
  });

  it("returns empty object when no keys match tag", () => {
    const registry = createTagRegistry();
    const env = { PORT: "3000" };
    expect(filterEnvByTag(env, registry, "secret")).toEqual({});
  });
});

describe("tagSummary", () => {
  it("returns a snapshot of the tag map", () => {
    const registry = createTagRegistry();
    registry.add("X", "a", "b");
    const summary = tagSummary(registry);
    expect(summary).toEqual({ X: ["a", "b"] });
  });
});
