import type { SupportedLanguageCode } from "../components/language/languagePreferences";

type AnalysisContent = {
  status: "fixture" | "generated";
  text: string;
};

type PlainLanguageMeaning = {
  status: "fixture" | "generated";
  directMeaning: string;
  interpretation: string | null;
};

type AcademicTerm = {
  term: string;
  generalMeaning: string;
  contextualMeaning: string;
  institutionSpecific: boolean;
  sourceText: string;
};

type AcademicImportance = {
  activity: string;
  explanation: string;
  sourceText: string;
};

type AnalysisAction = {
  description: string;
  requirement: "required" | "optional";
  sourceText: string;
};

type AnalysisDeadline = {
  description: string;
  kind: "explicit" | "relative";
  exactDate: string | null;
  sourceText: string;
};

type EngagementOpportunity = {
  description: string;
  kind: "questions" | "discussion" | "feedback" | "support";
  sourceText: string;
};

type AnalysisUncertainty = {
  description: string;
  clarification: string;
  sourceText: string | null;
};

export type AnalysisResponse = {
  data: {
    originalText: string;
    targetLanguage: SupportedLanguageCode;
    translation: AnalysisContent;
    plainLanguageMeaning: PlainLanguageMeaning;
    academicTerms: AcademicTerm[];
    academicImportance: AcademicImportance[];
    actions: AnalysisAction[];
    deadlines: AnalysisDeadline[];
    engagementOpportunities: EngagementOpportunity[];
    uncertainties: AnalysisUncertainty[];
  };
  meta: {
    mode: "mock" | "live";
    notice: string;
  };
};

type AnalysisRequest = {
  message: string;
  targetLanguage: SupportedLanguageCode;
};

export class AnalysisRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalysisRequestError";
  }
}

export async function requestAnalysis(
  analysisRequest: AnalysisRequest,
  signal?: AbortSignal,
): Promise<AnalysisResponse> {
  let response: Response;

  try {
    response = await fetch("/api/analyses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(analysisRequest),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }

    throw new AnalysisRequestError(
      "Lernova could not reach the analysis service. Check that the API is running, then try again.",
    );
  }

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    throw new AnalysisRequestError(
      getApiErrorMessage(responseBody) ??
        "The analysis service could not complete the request. Please try again.",
    );
  }

  if (!isAnalysisResponse(responseBody)) {
    throw new AnalysisRequestError(
      "The analysis service returned an unexpected response. Please try again.",
    );
  }

  return responseBody;
}

async function readResponseBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getApiErrorMessage(value: unknown) {
  if (!isRecord(value) || !isRecord(value.error)) {
    return null;
  }

  return typeof value.error.message === "string" ? value.error.message : null;
}

function isAnalysisResponse(value: unknown): value is AnalysisResponse {
  if (!isRecord(value) || !isRecord(value.data) || !isRecord(value.meta)) {
    return false;
  }

  const { data, meta } = value;

  return (
    typeof data.originalText === "string" &&
    (data.targetLanguage === "en" || data.targetLanguage === "ur") &&
    isAnalysisContent(data.translation) &&
    isPlainLanguageMeaning(data.plainLanguageMeaning) &&
    Array.isArray(data.academicTerms) &&
    Array.isArray(data.academicImportance) &&
    Array.isArray(data.actions) &&
    Array.isArray(data.deadlines) &&
    Array.isArray(data.engagementOpportunities) &&
    Array.isArray(data.uncertainties) &&
    data.uncertainties.every(isAnalysisUncertainty) &&
    (meta.mode === "mock" || meta.mode === "live") &&
    typeof meta.notice === "string"
  );
}

function isAnalysisContent(value: unknown): value is AnalysisContent {
  return (
    isRecord(value) &&
    (value.status === "fixture" || value.status === "generated") &&
    typeof value.text === "string"
  );
}

function isPlainLanguageMeaning(
  value: unknown,
): value is PlainLanguageMeaning {
  return (
    isRecord(value) &&
    (value.status === "fixture" || value.status === "generated") &&
    typeof value.directMeaning === "string" &&
    (value.interpretation === null ||
      typeof value.interpretation === "string")
  );
}

function isAnalysisUncertainty(value: unknown): value is AnalysisUncertainty {
  return (
    isRecord(value) &&
    typeof value.description === "string" &&
    typeof value.clarification === "string" &&
    (value.sourceText === null || typeof value.sourceText === "string")
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
