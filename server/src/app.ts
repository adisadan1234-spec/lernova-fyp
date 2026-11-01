import cors from "cors";
import express from "express";

interface AppOptions {
  clientOrigin?: string;
}

export function createApp(options: AppOptions = {}) {
  const app = express();

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

  app.use((_request, response) => {
    response.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
    });
  });

  return app;
}
