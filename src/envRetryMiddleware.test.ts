import { createRetryLoaderMiddleware, createSyncRetryMiddleware } from "./envRetryMiddleware";

describe("createRetryLoaderMiddleware", () => {
  it("returns env on first successful load", async () => {
    const loader = jest.fn().mockResolvedValue({ PORT: "3000" });
    const middleware = createRetryLoaderMiddleware(loader, { attempts: 3, delayMs: 0 });
    const result = await middleware();
    expect(result).toEqual({ PORT: "3000" });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("retries and returns env on eventual success", async () => {
    const loader = jest
      .fn()
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValue({ API_KEY: "abc" });
    const middleware = createRetryLoaderMiddleware(loader, { attempts: 3, delayMs: 0 });
    const result = await middleware();
    expect(result).toEqual({ API_KEY: "abc" });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("returns fallbackEnv after all retries fail", async () => {
    const loader = jest.fn().mockRejectedValue(new Error("network error"));
    const fallbackEnv = { NODE_ENV: "test" };
    const middleware = createRetryLoaderMiddleware(loader, {
      attempts: 2,
      delayMs: 0,
      fallbackEnv,
    });
    const result = await middleware();
    expect(result).toEqual(fallbackEnv);
  });

  it("returns empty object as default fallback", async () => {
    const loader = jest.fn().mockRejectedValue(new Error("fail"));
    const middleware = createRetryLoaderMiddleware(loader, { attempts: 1, delayMs: 0 });
    const result = await middleware();
    expect(result).toEqual({});
  });

  it("throws if loader returns non-object", async () => {
    const loader = jest.fn().mockResolvedValue(null as any);
    const middleware = createRetryLoaderMiddleware(loader, { attempts: 1, delayMs: 0 });
    const result = await middleware();
    expect(result).toEqual({});
  });
});

describe("createSyncRetryMiddleware", () => {
  it("returns env from loader on success", () => {
    const loader = jest.fn().mockReturnValue({ DB_URL: "postgres://localhost" });
    const result = createSyncRetryMiddleware(loader);
    expect(result).toEqual({ DB_URL: "postgres://localhost" });
  });

  it("returns fallback if loader always throws", () => {
    const loader = jest.fn().mockImplementation(() => { throw new Error("fail"); });
    const result = createSyncRetryMiddleware(loader, { FALLBACK: "yes" }, 2);
    expect(result).toEqual({ FALLBACK: "yes" });
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it("returns empty object as default fallback", () => {
    const loader = jest.fn().mockImplementation(() => { throw new Error("fail"); });
    const result = createSyncRetryMiddleware(loader, {}, 1);
    expect(result).toEqual({});
  });
});
