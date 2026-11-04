import { Router } from "express";

import { analysisRequestSchema } from "./analysis.schemas.js";
import { createMockAnalysis } from "./analysis.service.js";

export const analysisRouter = Router();

analysisRouter.post("/", (request, response) => {
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

  response.status(200).json(createMockAnalysis(parsedRequest.data));
});
