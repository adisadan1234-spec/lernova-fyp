import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import {
  analysisResponseSchema,
  MAX_MESSAGE_LENGTH,
} from "../src/analysis/analysis.schemas.js";
import { createApp } from "../src/app.js";
import {
  InvalidProviderResponseError,
  ProviderTimeoutError,
  ProviderUnavailableError,
} from "../src/language-processing/language-processing.errors.js";

describe("Lernova API foundation", () => {
  it("reports a healthy API", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        service: "lernova-api",
        status: "ok",
      },
    });
  });

  it("returns a consistent response for unknown routes", async () => {
    const response = await request(createApp()).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });
});

describe("POST /api/analyses", () => {
  it("returns a schema-valid, clearly labelled mock analysis", async () => {
    const message =
      "Submit your formative assessment before your next Project Huddle.";

    const response = await request(createApp()).post("/api/analyses").send({
      message,
      targetLanguage: "ur",
    });

    expect(response.status).toBe(200);
    expect(analysisResponseSchema.safeParse(response.body).success).toBe(true);
    expect(response.body).toMatchObject({
      data: {
        originalText: message,
        targetLanguage: "ur",
        translation: {
          status: "fixture",
        },
        uncertainties: [
          {
            sourceText: null,
          },
        ],
      },
      meta: {
        mode: "mock",
      },
    });
  });

  it("preserves valid original message whitespace", async () => {
    const message = "  Attend the seminar tomorrow.\n";

    const response = await request(createApp()).post("/api/analyses").send({
      message,
      targetLanguage: "en",
    });

    expect(response.status).toBe(200);
    expect(response.body.data.originalText).toBe(message);
  });

  it.each([
    {
      name: "an empty message",
      body: { message: "   \n", targetLanguage: "en" },
      field: "message",
    },
    {
      name: "an over-limit message",
      body: { message: "a".repeat(MAX_MESSAGE_LENGTH + 1), targetLanguage: "en" },
      field: "message",
    },
    {
      name: "an unsupported language",
      body: { message: "Attend the seminar.", targetLanguage: "fr" },
      field: "targetLanguage",
    },
    {
      name: "an unexpected property",
      body: {
        message: "Attend the seminar.",
        targetLanguage: "en",
        providerKey: "must-not-be-accepted",
      },
      field: undefined,
    },
  ])("rejects $name", async ({ body, field }) => {
    const response = await request(createApp()).post("/api/analyses").send(body);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "The analysis request contains invalid information.",
      },
    });

    if (field) {
      expect(response.body.error.details.fieldErrors[field]).toBeDefined();
    } else {
      expect(response.body.error.details.formErrors).not.toHaveLength(0);
    }
  });

  it("returns a consistent error for malformed JSON", async () => {
    const response = await request(createApp())
      .post("/api/analyses")
      .set("Content-Type", "application/json")
      .send('{"message":');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: {
        code: "INVALID_JSON",
        message: "The request body must contain valid JSON.",
      },
    });
  });

  it("returns a consistent error when the JSON body exceeds the parser limit", async () => {
    const response = await request(createApp()).post("/api/analyses").send({
      message: "a".repeat(33 * 1_024),
      targetLanguage: "en",
    });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      error: {
        code: "PAYLOAD_TOO_LARGE",
        message: "The request body is too large.",
      },
    });
  });

  it.each([
    {
      error: new ProviderUnavailableError(),
      status: 503,
      code: "ANALYSIS_UNAVAILABLE",
      message: "The analysis service is temporarily unavailable. Please try again.",
    },
    {
      error: new ProviderTimeoutError(),
      status: 504,
      code: "ANALYSIS_TIMEOUT",
      message: "The analysis took too long. Please try again.",
    },
    {
      error: new InvalidProviderResponseError(),
      status: 502,
      code: "INVALID_ANALYSIS_RESPONSE",
      message: "The analysis service returned an invalid response. Please try again.",
    },
  ])("maps $code failures to a recoverable API error", async (failure) => {
    const languageProcessor = {
      process: vi.fn().mockRejectedValue(failure.error),
    };

    const response = await request(createApp({ languageProcessor }))
      .post("/api/analyses")
      .send({
        message: "Attend the project meeting.",
        targetLanguage: "en",
      });

    expect(response.status).toBe(failure.status);
    expect(response.body).toEqual({
      error: {
        code: failure.code,
        message: failure.message,
      },
    });
  });
});
