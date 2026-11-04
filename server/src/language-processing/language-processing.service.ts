import {
  InvalidProviderResponseError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from "./language-processing.errors.js";
import type {
  LanguageProcessingProvider,
  LanguageProcessingRequest,
} from "./language-processing.provider.js";
import {
  languageProcessingOutputSchema,
  type LanguageProcessingOutput,
} from "./language-processing.schemas.js";
import { MockLanguageProcessingProvider } from "./providers/mock-language-processing.provider.js";

export const DEFAULT_LANGUAGE_PROCESSING_TIMEOUT_MS = 15_000;

export type LanguageProcessor = {
  process(request: LanguageProcessingRequest): Promise<LanguageProcessingOutput>;
};

export class LanguageProcessingService implements LanguageProcessor {
  constructor(
    private readonly provider: LanguageProcessingProvider,
    private readonly timeoutMs = DEFAULT_LANGUAGE_PROCESSING_TIMEOUT_MS,
  ) {}

  async process(
    request: LanguageProcessingRequest,
  ): Promise<LanguageProcessingOutput> {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const timeout = new Promise<never>((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        controller.abort();
        reject(new ProviderTimeoutError());
      }, this.timeoutMs);
    });

    let providerOutput: unknown;

    try {
      providerOutput = await Promise.race([
        this.provider.process(request, { signal: controller.signal }),
        timeout,
      ]);
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        throw error;
      }

      throw new ProviderUnavailableError({ cause: error });
    } finally {
      clearTimeout(timeoutId);
    }

    const parsedOutput = languageProcessingOutputSchema.safeParse(providerOutput);

    if (!parsedOutput.success) {
      throw new InvalidProviderResponseError({ cause: parsedOutput.error });
    }

    return parsedOutput.data;
  }
}

type LanguageProcessingConfiguration = {
  provider: "mock";
  apiKey?: string;
  timeoutMs?: number;
};

export function createLanguageProcessingService(
  configuration: LanguageProcessingConfiguration,
) {
  switch (configuration.provider) {
    case "mock":
      return new LanguageProcessingService(
        new MockLanguageProcessingProvider(),
        configuration.timeoutMs,
      );
  }
}
