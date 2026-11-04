import { z } from "zod";

const environmentSchema = z.object({
  CLIENT_ORIGIN: z.url().default("http://localhost:5173"),
  LANGUAGE_PROCESSING_PROVIDER: z
    .enum(["mock", "mymemory"])
    .default("mock"),
  LANGUAGE_PROCESSING_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(120_000)
    .default(15_000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
});

export function readEnvironment(environment: NodeJS.ProcessEnv) {
  return environmentSchema.parse(environment);
}
