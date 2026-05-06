import {
  captureSnapshot,
  restoreSnapshot,
  diffSnapshots,
  withEnvSnapshot,
} from "./envSnapshot";

describe("captureSnapshot", () => {
  it("captures a copy of the provided env object", () => {
    const env = { FOO: "bar", BAZ: "qux" };
    const snapshot = captureSnapshot(env);
    expect(snapshot.data).toEqual({ FOO: "bar", BAZ: "qux" });
    expect(typeof snapshot.timestamp).toBe("number");
  });

  it("does not reflect mutations to the original env after capture", () => {
    const env: Record<string, string | undefined> = { FOO: "bar" };
    const snapshot = captureSnapshot(env);
    env["FOO"] = "mutated";
    expect(snapshot.data["FOO"]).toBe("bar");
  });

  it("returns a frozen data object", () => {
    const snapshot = captureSnapshot({ X: "1" });
    expect(Object.isFrozen(snapshot.data)).toBe(true);
  });
});

describe("restoreSnapshot", () => {
  it("restores values from snapshot", () => {
    const target: Record<string, string | undefined> = { A: "original" };
    const snapshot = captureSnapshot(target);
    target["A"] = "changed";
    restoreSnapshot(snapshot, target);
    expect(target["A"]).toBe("original");
  });

  it("removes keys added after snapshot", () => {
    const target: Record<string, string | undefined> = { A: "1" };
    const snapshot = captureSnapshot(target);
    target["NEW_KEY"] = "new";
    restoreSnapshot(snapshot, target);
    expect("NEW_KEY" in target).toBe(false);
  });

  it("removes keys that were undefined in snapshot", () => {
    const target: Record<string, string | undefined> = {};
    const snapshot = captureSnapshot(target);
    target["ADDED"] = "value";
    restoreSnapshot(snapshot, target);
    expect("ADDED" in target).toBe(false);
  });
});

describe("diffSnapshots", () => {
  it("detects added keys", () => {
    const before = captureSnapshot({ A: "1" });
    const after = captureSnapshot({ A: "1", B: "2" });
    const diff = diffSnapshots(before, after);
    expect(diff.added).toEqual({ B: "2" });
  });

  it("detects removed keys", () => {
    const before = captureSnapshot({ A: "1", B: "2" });
    const after = captureSnapshot({ A: "1" });
    const diff = diffSnapshots(before, after);
    expect(diff.removed).toEqual({ B: "2" });
  });

  it("detects changed keys", () => {
    const before = captureSnapshot({ A: "old" });
    const after = captureSnapshot({ A: "new" });
    const diff = diffSnapshots(before, after);
    expect(diff.changed).toEqual({ A: { from: "old", to: "new" } });
  });

  it("returns empty diff for identical snapshots", () => {
    const snap = captureSnapshot({ A: "1" });
    const diff = diffSnapshots(snap, snap);
    expect(diff.added).toEqual({});
    expect(diff.removed).toEqual({});
    expect(diff.changed).toEqual({});
  });
});

describe("withEnvSnapshot", () => {
  it("applies overrides during callback and restores afterward", async () => {
    process.env["TEST_SNAP_KEY"] = "original";
    let valueInsideCallback: string | undefined;

    await withEnvSnapshot({ TEST_SNAP_KEY: "overridden" }, () => {
      valueInsideCallback = process.env["TEST_SNAP_KEY"];
    });

    expect(valueInsideCallback).toBe("overridden");
    expect(process.env["TEST_SNAP_KEY"]).toBe("original");
    delete process.env["TEST_SNAP_KEY"];
  });

  it("restores env even if callback throws", async () => {
    process.env["ERR_KEY"] = "before";
    await expect(
      withEnvSnapshot({ ERR_KEY: "during" }, () => {
        throw new Error("oops");
      })
    ).rejects.toThrow("oops");
    expect(process.env["ERR_KEY"]).toBe("before");
    delete process.env["ERR_KEY"];
  });
});
