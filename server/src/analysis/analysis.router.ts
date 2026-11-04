import { Router } from "express";

import {
  InvalidProviderResponseError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from "../language-processing/language-processing.errors.js";
import type { LanguageProcessor } from "../language-processing/language-processing.service.js";
import { analysisRequestSchema } from "./analysis.schemas.js";
import { createAnalysis } from "./analysis.service.js";

export function createAnalysisRouter(languageProcessor: LanguageProcessor) {
  const analysisRouter = Router();

  analysisRouter.post("/", async (request, response, next) => {
    const parsedRequest = analysisRequestSchema.safeParse(request.body);

    if (!parsedRequest.success) {
      response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "The analysis request contains invalid information.",
          details: parsedRequest.error.flatten(),
        },
      });
      return;
    }

    try {
      response
        .status(200)
        .json(await createAnalysis(parsedRequest.data, languageProcessor));
    } catch (error) {
      if (error instanceof ProviderTimeoutError) {
        response.status(504).json({
          error: {
            code: "ANALYSIS_TIMEOUT",
            message: "The analysis took too long. Please try again.",
          },
        });
        return;
      }

      if (error instanceof ProviderUnavailableError) {
        response.status(503).json({
          error: {
            code: "ANALYSIS_UNAVAILABLE",
            message: "The analysis service is temporarily unavailable. Please try again.",
          },
        });
        return;
      }

      if (error instanceof InvalidProviderResponseError) {
        response.status(502).json({
          error: {
            code: "INVALID_ANALYSIS_RESPONSE",
            message: "The analysis service returned an invalid response. Please try again.",
          },
        });
        return;
      }

      next(error);
    }
  });

  return analysisRouter;
}
