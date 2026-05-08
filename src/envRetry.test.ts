import { retryAsync, withRetryFallback } from "./envRetry";

describe("retryAsync", () => {
  it("resolves immediately on first success", async () => {
    const fn = jest.fn().mockResolvedValue(42);
    const result = await retryAsync(fn, { attempts: 3, delayMs: 0 });
    expect(result.value).toBe(42);
    expect(result.attempts).toBe(1);
    expect(result.succeeded).toBe(true);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("ok");
    const result = await retryAsync(fn, { attempts: 3, delayMs: 0 });
    expect(result.value).toBe("ok");
    expect(result.attempts).toBe(3);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("throws after exhausting all attempts", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("always fails"));
    await expect(retryAsync(fn, { attempts: 3, delayMs: 0 })).rejects.toThrow("always fails");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("calls onRetry callback on each failure", async () => {
    const onRetry = jest.fn();
    const fn = jest.fn().mockRejectedValue(new Error("err"));
    await expect(
      retryAsync(fn, { attempts: 2, delayMs: 0, onRetry })
    ).rejects.toThrow();
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry.mock.calls[0][0]).toBe(1);
    expect(onRetry.mock.calls[1][0]).toBe(2);
  });

  it("supports exponential backoff (smoke test)", async () => {
    const fn = jest.fn().mockResolvedValue("done");
    const result = await retryAsync(fn, { attempts: 1, delayMs: 0, backoff: "exponential" });
    expect(result.succeeded).toBe(true);
  });
});

describe("withRetryFallback", () => {
  it("returns value on first success", () => {
    const result = withRetryFallback(() => "env_value", "default");
    expect(result).toBe("env_value");
  });

  it("returns fallback after all attempts fail", () => {
    const fn = jest.fn().mockImplementation(() => { throw new Error("fail"); });
    const result = withRetryFallback(fn, "fallback", 3);
    expect(result).toBe("fallback");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("succeeds on second attempt", () => {
    let calls = 0;
    const result = withRetryFallback(() => {
      calls++;
      if (calls < 2) throw new Error("not yet");
      return "success";
    }, "fallback", 3);
    expect(result).toBe("success");
    expect(calls).toBe(2);
  });
});
