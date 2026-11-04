import cors from "cors";
import express, { type ErrorRequestHandler } from "express";

import { createAnalysisRouter } from "./analysis/analysis.router.js";
import {
  createLanguageProcessingService,
  type LanguageProcessor,
} from "./language-processing/language-processing.service.js";

interface AppOptions {
  clientOrigin?: string;
  languageProcessor?: LanguageProcessor;
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const languageProcessor =
    options.languageProcessor ??
    createLanguageProcessingService({ provider: "mock" });

  app.disable("x-powered-by");
  app.use(
    cors({
      origin: options.clientOrigin ?? "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "32kb" }));

  app.get("/api/health", (_request, response) => {
    response.status(200).json({
      data: {
        service: "lernova-api",
        status: "ok",
      },
    });
  });

  app.use("/api/analyses", createAnalysisRouter(languageProcessor));

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });

  const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    void next;

    if (isHttpError(error, 400)) {
      response.status(400).json({
        error: {
          code: "INVALID_JSON",
          message: "The request body must contain valid JSON.",
        },
      });
      return;
    }

    if (isHttpError(error, 413)) {
      response.status(413).json({
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "The request body is too large.",
        },
      });
      return;
    }

    response.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "The request could not be completed. Please try again.",
      },
    });
  };

  app.use(errorHandler);

  return app;
}

function isHttpError(error: unknown, status: number): error is Error & { status: number } {
  return error instanceof Error && "status" in error && error.status === status;
}
