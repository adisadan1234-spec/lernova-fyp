import { z } from "zod";

const contentStatusSchema = z.enum(["fixture", "generated"]);
const nonBlankContentSchema = z
  .string()
  .min(1)
  .refine((text) => text.trim().length > 0, {
    error: "Generated content must include non-whitespace text.",
  });

const generatedContentSchema = z.strictObject({
  status: contentStatusSchema,
  text: nonBlankContentSchema,
});

const plainLanguageMeaningSchema = z.strictObject({
  status: contentStatusSchema,
  directMeaning: nonBlankContentSchema,
  interpretation: nonBlankContentSchema.nullable(),
});

export const languageProcessingOutputSchema = z.strictObject({
  translation: generatedContentSchema,
  plainLanguageMeaning: plainLanguageMeaningSchema,
  notice: z.string().trim().min(1),
});

export type LanguageProcessingOutput = z.infer<
  typeof languageProcessingOutputSchema
>;
