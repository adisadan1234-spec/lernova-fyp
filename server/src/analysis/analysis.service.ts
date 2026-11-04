import {
  analysisResponseSchema,
  type AnalysisRequest,
  type AnalysisResponse,
} from "./analysis.schemas.js";

const FIXTURE_NOTICE =
  "Development fixture only. No translation or message analysis has been performed.";

export function createMockAnalysis(request: AnalysisRequest): AnalysisResponse {
  return analysisResponseSchema.parse({
    data: {
      originalText: request.message,
      targetLanguage: request.targetLanguage,
      translation: {
        status: "fixture",
        text: "Translation will be added in a later development task.",
      },
      plainLanguageMeaning: {
        status: "fixture",
        text: "A contextual plain-language explanation will be added in a later development task.",
      },
      academicTerms: [],
      academicImportance: [],
      actions: [],
      deadlines: [],
      engagementOpportunities: [],
      uncertainties: [
        {
          description: FIXTURE_NOTICE,
          clarification:
            "Do not use this fixture to make an academic decision. Check the original message or ask the relevant university staff member.",
          sourceText: null,
        },
      ],
    },
    meta: {
      mode: "mock",
      notice: FIXTURE_NOTICE,
    },
  });
}
