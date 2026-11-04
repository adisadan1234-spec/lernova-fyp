import {
  analysisResponseSchema,
  type AnalysisRequest,
  type AnalysisResponse,
} from "./analysis.schemas.js";
import type { LanguageProcessor } from "../language-processing/language-processing.service.js";

export async function createAnalysis(
  request: AnalysisRequest,
  languageProcessor: LanguageProcessor,
): Promise<AnalysisResponse> {
  const languageProcessingOutput = await languageProcessor.process({
    sourceText: request.message,
    targetLanguage: request.targetLanguage,
  });
  const hasGeneratedTranslation =
    languageProcessingOutput.translation.status === "generated";

  return analysisResponseSchema.parse({
    data: {
      originalText: request.message,
      targetLanguage: request.targetLanguage,
      translation: languageProcessingOutput.translation,
      plainLanguageMeaning: languageProcessingOutput.plainLanguageMeaning,
      academicTerms: [],
      academicImportance: [],
      actions: [],
      deadlines: [],
      engagementOpportunities: [],
      uncertainties: [
        {
          description: languageProcessingOutput.notice,
          clarification: hasGeneratedTranslation
            ? "Use the original message as the source of truth and confirm important wording, dates, or module-specific requirements with the relevant university staff member."
            : "Do not use this fixture to make an academic decision. Check the original message or ask the relevant university staff member.",
          sourceText: null,
        },
      ],
    },
    meta: {
      mode: hasGeneratedTranslation ? "live" : "mock",
      notice: languageProcessingOutput.notice,
    },
  });
}
