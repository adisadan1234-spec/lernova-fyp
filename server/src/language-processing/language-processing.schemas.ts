import { z } from "zod";

const generatedContentSchema = z.strictObject({
  status: z.enum(["fixture", "generated"]),
  text: z.string().min(1).refine((text) => text.trim().length > 0, {
    error: "Generated content must include non-whitespace text.",
  }),
});

export const languageProcessingOutputSchema = z.strictObject({
  translation: generatedContentSchema,
  plainLanguageMeaning: generatedContentSchema,
  notice: z.string().trim().min(1),
});

export type LanguageProcessingOutput = z.infer<
  typeof languageProcessingOutputSchema
>;
