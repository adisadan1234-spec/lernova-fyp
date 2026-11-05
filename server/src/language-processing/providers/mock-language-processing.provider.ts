import type {
  LanguageProcessingContext,
  LanguageProcessingProvider,
  LanguageProcessingRequest,
} from "../language-processing.provider.js";

const FIXTURE_NOTICE =
  "Development fixture only. No translation or message analysis has been performed.";

export class MockLanguageProcessingProvider
  implements LanguageProcessingProvider
{
  readonly id = "mock";

  async process(
    _request: LanguageProcessingRequest,
    context: LanguageProcessingContext,
  ): Promise<unknown> {
    if (context.signal.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    return Promise.resolve({
      translation: {
        status: "fixture",
        text: "Translation will be added in a later development task.",
      },
      plainLanguageMeaning: {
        status: "fixture",
        directMeaning:
          "A contextual plain-language explanation is unavailable in mock mode.",
        interpretation: null,
      },
      notice: FIXTURE_NOTICE,
    });
  }
}
