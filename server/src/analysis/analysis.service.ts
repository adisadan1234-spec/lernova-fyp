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
          clarification:
            "Do not use this fixture to make an academic decision. Check the original message or ask the relevant university staff member.",
          sourceText: null,
        },
      ],
    },
    meta: {
      mode: "mock",
      notice: languageProcessingOutput.notice,
    },
  });
}
