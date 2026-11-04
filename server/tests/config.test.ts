import { describe, expect, it } from "vitest";

import { readEnvironment } from "../src/config.js";

describe("server environment", () => {
  it("uses mock language processing and a finite timeout by default", () => {
    const environment = readEnvironment({});

    expect(environment).toMatchObject({
      LANGUAGE_PROCESSING_PROVIDER: "mock",
      LANGUAGE_PROCESSING_TIMEOUT_MS: 15_000,
    });
    expect(environment.LANGUAGE_PROCESSING_API_KEY).toBeUndefined();
  });

  it("normalises a blank key and validates configured server-only values", () => {
    const environment = readEnvironment({
      LANGUAGE_PROCESSING_API_KEY: "   ",
      LANGUAGE_PROCESSING_PROVIDER: "mock",
      LANGUAGE_PROCESSING_TIMEOUT_MS: "2500",
    });

    expect(environment).toMatchObject({
      LANGUAGE_PROCESSING_PROVIDER: "mock",
      LANGUAGE_PROCESSING_TIMEOUT_MS: 2_500,
    });
    expect(environment.LANGUAGE_PROCESSING_API_KEY).toBeUndefined();

    expect(
      readEnvironment({ LANGUAGE_PROCESSING_API_KEY: " server-key " })
        .LANGUAGE_PROCESSING_API_KEY,
    ).toBe("server-key");
  });

  it("rejects unsupported providers and unsafe timeout values", () => {
    expect(() =>
      readEnvironment({ LANGUAGE_PROCESSING_PROVIDER: "unsupported" }),
    ).toThrow();
    expect(() =>
      readEnvironment({ LANGUAGE_PROCESSING_TIMEOUT_MS: "0" }),
    ).toThrow();
  });
});
