import type { SupportedLanguage } from "../analysis/analysis.schemas.js";

export type LanguageProcessingRequest = {
  sourceText: string;
  targetLanguage: SupportedLanguage;
};

export type LanguageProcessingContext = {
  signal: AbortSignal;
};

export interface LanguageProcessingProvider {
  readonly id: string;
  process(
    request: LanguageProcessingRequest,
    context: LanguageProcessingContext,
  ): Promise<unknown>;
}
