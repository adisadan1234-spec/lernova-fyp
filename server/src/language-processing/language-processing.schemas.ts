import { z } from "zod";

const generatedContentSchema = z.strictObject({
  status: z.enum(["fixture", "generated"]),
  text: z.string().trim().min(1),
});

export const languageProcessingOutputSchema = z.strictObject({
  translation: generatedContentSchema,
  plainLanguageMeaning: generatedContentSchema,
  notice: z.string().trim().min(1),
});

export type LanguageProcessingOutput = z.infer<
  typeof languageProcessingOutputSchema
>;
