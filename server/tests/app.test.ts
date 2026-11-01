import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../src/app.js";

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
