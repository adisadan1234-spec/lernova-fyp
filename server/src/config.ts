import { z } from "zod";

const environmentSchema = z.object({
  CLIENT_ORIGIN: z.url().default("http://localhost:5173"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
});

export function readEnvironment(environment: NodeJS.ProcessEnv) {
  return environmentSchema.parse(environment);
}
