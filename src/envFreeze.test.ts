import { describe, it, expect } from "vitest";
import {
  deepFreeze,
  sealEnv,
  applyFreeze,
  isFrozen,
  isSealed,
  frozenCopy,
} from "./envFreeze";

describe("deepFreeze", () => {
  it("freezes a shallow object", () => {
    const obj = { PORT: "3000" };
    const frozen = deepFreeze(obj);
    expect(Object.isFrozen(frozen)).toBe(true);
  });

  it("freezes nested objects", () => {
    const obj = { db: { host: "localhost", port: 5432 } };
    const frozen = deepFreeze(obj);
    expect(Object.isFrozen(frozen.db)).toBe(true);
  });

  it("prevents property mutation", () => {
    const obj = deepFreeze({ PORT: "3000" });
    expect(() => {
      (obj as Record<string, string>).PORT = "4000";
    }).toThrow();
  });

  it("prevents adding new properties", () => {
    const obj = deepFreeze({ PORT: "3000" });
    expect(() => {
      (obj as Record<string, string>).NEW_KEY = "value";
    }).toThrow();
  });
});

describe("sealEnv", () => {
  it("seals an object", () => {
    const obj = { PORT: "3000" };
    const sealed = sealEnv(obj);
    expect(Object.isSealed(sealed)).toBe(true);
  });

  it("allows mutation of existing properties when sealed", () => {
    const obj = sealEnv({ PORT: "3000" });
    expect(() => {
      obj.PORT = "4000";
    }).not.toThrow();
    expect(obj.PORT).toBe("4000");
  });

  it("prevents adding new properties when sealed", () => {
    const obj = sealEnv({ PORT: "3000" });
    expect(() => {
      (obj as Record<string, string>).NEW_KEY = "value";
    }).toThrow();
  });
});

describe("applyFreeze", () => {
  it("deep freezes by default", () => {
    const obj = applyFreeze({ nested: { val: 1 } });
    expect(Object.isFrozen(obj)).toBe(true);
  });

  it("seals when seal option is true", () => {
    const obj = applyFreeze({ PORT: "3000" }, { seal: true });
    expect(Object.isSealed(obj)).toBe(true);
    expect(Object.isFrozen(obj)).toBe(false);
  });

  it("shallow freezes when deep is false", () => {
    const nested = { val: 1 };
    const obj = applyFreeze({ nested }, { deep: false });
    expect(Object.isFrozen(obj)).toBe(true);
    expect(Object.isFrozen(nested)).toBe(false);
  });
});

describe("isFrozen / isSealed", () => {
  it("returns true for frozen objects", () => {
    expect(isFrozen(Object.freeze({}))).toBe(true);
  });

  it("returns false for plain objects", () => {
    expect(isFrozen({})).toBe(false);
  });

  it("returns true for sealed objects", () => {
    expect(isSealed(Object.seal({}))).toBe(true);
  });

  it("returns false for plain objects (isSealed)", () => {
    expect(isSealed({})).toBe(false);
  });
});

describe("frozenCopy", () => {
  it("returns a frozen copy without mutating original", () => {
    const original = { PORT: "3000" };
    const copy = frozenCopy(original);
    expect(Object.isFrozen(copy)).toBe(true);
    expect(Object.isFrozen(original)).toBe(false);
  });

  it("copy reflects original values", () => {
    const original = { HOST: "localhost", PORT: "5432" };
    const copy = frozenCopy(original);
    expect(copy.HOST).toBe("localhost");
    expect(copy.PORT).toBe("5432");
  });
});
