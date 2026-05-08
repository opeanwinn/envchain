import {
  computeChecksum,
  createVersion,
  createVersionRegistry,
  recordVersion,
  hasVersionChanged,
  getVersionByNumber,
} from "./envVersion";

describe("computeChecksum", () => {
  it("returns a hex string", () => {
    const result = computeChecksum({ FOO: "bar" });
    expect(typeof result).toBe("string");
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  it("is deterministic for the same input", () => {
    const env = { A: "1", B: "2" };
    expect(computeChecksum(env)).toBe(computeChecksum(env));
  });

  it("differs when values change", () => {
    expect(computeChecksum({ A: "1" })).not.toBe(computeChecksum({ A: "2" }));
  });

  it("is order-independent for keys", () => {
    const a = computeChecksum({ A: "1", B: "2" });
    const b = computeChecksum({ B: "2", A: "1" });
    expect(a).toBe(b);
  });
});

describe("createVersion", () => {
  it("creates a version with correct number", () => {
    const v = createVersion({ X: "y" }, 3);
    expect(v.version).toBe(3);
    expect(v.keys).toContain("X");
    expect(typeof v.checksum).toBe("string");
    expect(typeof v.timestamp).toBe("number");
  });
});

describe("createVersionRegistry", () => {
  it("starts with null current and empty history", () => {
    const reg = createVersionRegistry();
    expect(reg.current).toBeNull();
    expect(reg.history).toHaveLength(0);
  });
});

describe("recordVersion", () => {
  it("sets current on first record", () => {
    const reg = createVersionRegistry();
    const updated = recordVersion(reg, { A: "1" });
    expect(updated.current?.version).toBe(1);
    expect(updated.history).toHaveLength(0);
  });

  it("increments version on subsequent records", () => {
    let reg = createVersionRegistry();
    reg = recordVersion(reg, { A: "1" });
    reg = recordVersion(reg, { A: "2" });
    expect(reg.current?.version).toBe(2);
    expect(reg.history).toHaveLength(1);
    expect(reg.history[0].version).toBe(1);
  });
});

describe("hasVersionChanged", () => {
  it("returns true when no current version", () => {
    const reg = createVersionRegistry();
    expect(hasVersionChanged(reg, { A: "1" })).toBe(true);
  });

  it("returns false when env matches current checksum", () => {
    let reg = createVersionRegistry();
    const env = { A: "1" };
    reg = recordVersion(reg, env);
    expect(hasVersionChanged(reg, env)).toBe(false);
  });

  it("returns true when env has changed", () => {
    let reg = createVersionRegistry();
    reg = recordVersion(reg, { A: "1" });
    expect(hasVersionChanged(reg, { A: "2" })).toBe(true);
  });
});

describe("getVersionByNumber", () => {
  it("returns the current version by number", () => {
    let reg = createVersionRegistry();
    reg = recordVersion(reg, { A: "1" });
    const v = getVersionByNumber(reg, 1);
    expect(v?.version).toBe(1);
  });

  it("returns a historical version by number", () => {
    let reg = createVersionRegistry();
    reg = recordVersion(reg, { A: "1" });
    reg = recordVersion(reg, { A: "2" });
    const v = getVersionByNumber(reg, 1);
    expect(v?.version).toBe(1);
  });

  it("returns undefined for unknown version", () => {
    const reg = createVersionRegistry();
    expect(getVersionByNumber(reg, 99)).toBeUndefined();
  });
});
