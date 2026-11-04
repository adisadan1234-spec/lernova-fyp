import { afterEach, describe, expect, it, vi } from "vitest";

import {
  InvalidProviderResponseError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from "../src/language-processing/language-processing.errors.js";
import type {
  LanguageProcessingContext,
  LanguageProcessingProvider,
  LanguageProcessingRequest,
} from "../src/language-processing/language-processing.provider.js";
import {
  createLanguageProcessingService,
  LanguageProcessingService,
} from "../src/language-processing/language-processing.service.js";

const request: LanguageProcessingRequest = {
  sourceText: "Submit your formative assessment before Friday.",
  targetLanguage: "ur",
};

const validProviderOutput = {
  translation: {
    status: "fixture",
    text: "Fixture translation",
  },
  plainLanguageMeaning: {
    status: "fixture",
    text: "Fixture meaning",
  },
  notice: "Development fixture only.",
};

afterEach(() => {
  vi.useRealTimers();
});

describe("LanguageProcessingService", () => {
  it("returns schema-validated provider output", async () => {
    const process = vi.fn().mockResolvedValue(validProviderOutput);
    const provider = createProvider(process);
    const service = new LanguageProcessingService(provider, 1_000);

    await expect(service.process(request)).resolves.toEqual(validProviderOutput);
    expect(process).toHaveBeenCalledOnce();
    expect(process).toHaveBeenCalledWith(request, {
      signal: expect.any(AbortSignal),
    });
  });

  it("validates generated text without changing its whitespace", async () => {
    const outputWithWhitespace = {
      ...validProviderOutput,
      translation: {
        status: "generated",
        text: "  Attend the seminar tomorrow.\n",
      },
    };
    const service = new LanguageProcessingService(
      createProvider(vi.fn().mockResolvedValue(outputWithWhitespace)),
      1_000,
    );

    await expect(service.process(request)).resolves.toMatchObject({
      translation: {
        text: "  Attend the seminar tomorrow.\n",
      },
    });
  });

  it("rejects malformed provider output before it reaches the API", async () => {
    const provider = createProvider(
      vi.fn().mockResolvedValue({
        translation: { status: "generated", text: "" },
      }),
    );
    const service = new LanguageProcessingService(provider, 1_000);

    await expect(service.process(request)).rejects.toBeInstanceOf(
      InvalidProviderResponseError,
    );
  });

  it("normalises provider failures without exposing their message", async () => {
    const provider = createProvider(
      vi.fn().mockRejectedValue(new Error("provider secret detail")),
    );
    const service = new LanguageProcessingService(provider, 1_000);

    const processing = service.process(request);

    await expect(processing).rejects.toBeInstanceOf(ProviderUnavailableError);
    await expect(processing).rejects.not.toThrow("provider secret detail");
  });

  it("enforces its configured timeout and aborts provider work", async () => {
    vi.useFakeTimers();
    let providerSignal: AbortSignal | undefined;
    const provider = createProvider(
      vi.fn(
        (_request: LanguageProcessingRequest, context: LanguageProcessingContext) => {
          providerSignal = context.signal;
          return new Promise(() => undefined);
        },
      ),
    );
    const service = new LanguageProcessingService(provider, 100);

    const processing = service.process(request);
    const timeoutExpectation = expect(processing).rejects.toBeInstanceOf(
      ProviderTimeoutError,
    );

    await vi.advanceTimersByTimeAsync(100);
    await timeoutExpectation;
    expect(providerSignal?.aborted).toBe(true);
  });

  it("creates a deterministic mock provider without an external call", async () => {
    const service = createLanguageProcessingService({
      provider: "mock",
      timeoutMs: 1_000,
    });

    await expect(service.process(request)).resolves.toMatchObject({
      translation: { status: "fixture" },
      plainLanguageMeaning: { status: "fixture" },
      notice:
        "Development fixture only. No translation or message analysis has been performed.",
    });
  });
});

function createProvider(
  process: LanguageProcessingProvider["process"],
): LanguageProcessingProvider {
  return {
    id: "test-provider",
    process,
  };
}
