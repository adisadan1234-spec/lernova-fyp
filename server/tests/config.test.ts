import { describe, expect, it } from "vitest";

import { readEnvironment } from "../src/config.js";

describe("server environment", () => {
  it("uses mock language processing and a finite timeout by default", () => {
    const environment = readEnvironment({});

    expect(environment).toMatchObject({
      LANGUAGE_PROCESSING_PROVIDER: "mock",
      LANGUAGE_PROCESSING_TIMEOUT_MS: 15_000,
    });
  });

  it("accepts the no-cost MyMemory provider and a configured timeout", () => {
    const environment = readEnvironment({
      LANGUAGE_PROCESSING_PROVIDER: "mymemory",
      LANGUAGE_PROCESSING_TIMEOUT_MS: "2500",
    });

    expect(environment).toMatchObject({
      LANGUAGE_PROCESSING_PROVIDER: "mymemory",
      LANGUAGE_PROCESSING_TIMEOUT_MS: 2_500,
    });
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
