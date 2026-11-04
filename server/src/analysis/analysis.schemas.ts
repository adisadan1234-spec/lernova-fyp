import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 5_000;

export const supportedLanguageSchema = z.enum(["en", "ur"], {
  error: "Choose a supported target language.",
});

export const analysisRequestSchema = z.strictObject({
  message: z
    .string({ error: "Message must be text." })
    .max(
      MAX_MESSAGE_LENGTH,
      `Message must be ${MAX_MESSAGE_LENGTH.toLocaleString("en-GB")} characters or fewer.`,
    )
    .refine((message) => message.trim().length > 0, {
      error: "Enter a university message to analyse.",
    }),
  targetLanguage: supportedLanguageSchema,
});

const analysisContentSchema = z.strictObject({
  status: z.enum(["fixture", "generated"]),
  text: z.string().min(1),
});

const academicTermSchema = z.strictObject({
  term: z.string().min(1),
  generalMeaning: z.string().min(1),
  contextualMeaning: z.string().min(1),
  institutionSpecific: z.boolean(),
  sourceText: z.string().min(1),
});

const academicImportanceSchema = z.strictObject({
  activity: z.string().min(1),
  explanation: z.string().min(1),
  sourceText: z.string().min(1),
});

const actionSchema = z.strictObject({
  description: z.string().min(1),
  requirement: z.enum(["required", "optional"]),
  sourceText: z.string().min(1),
});

const deadlineSchema = z.strictObject({
  description: z.string().min(1),
  kind: z.enum(["explicit", "relative"]),
  exactDate: z.string().min(1).nullable(),
  sourceText: z.string().min(1),
});

const engagementOpportunitySchema = z.strictObject({
  description: z.string().min(1),
  kind: z.enum(["questions", "discussion", "feedback", "support"]),
  sourceText: z.string().min(1),
});

const uncertaintySchema = z.strictObject({
  description: z.string().min(1),
  clarification: z.string().min(1),
  sourceText: z.string().min(1).nullable(),
});

export const analysisResponseSchema = z.strictObject({
  data: z.strictObject({
    originalText: z.string().min(1).max(MAX_MESSAGE_LENGTH),
    targetLanguage: supportedLanguageSchema,
    translation: analysisContentSchema,
    plainLanguageMeaning: analysisContentSchema,
    academicTerms: z.array(academicTermSchema),
    academicImportance: z.array(academicImportanceSchema),
    actions: z.array(actionSchema),
    deadlines: z.array(deadlineSchema),
    engagementOpportunities: z.array(engagementOpportunitySchema),
    uncertainties: z.array(uncertaintySchema),
  }),
  meta: z.strictObject({
    mode: z.enum(["mock", "live"]),
    notice: z.string().min(1),
  }),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type AnalysisResponse = z.infer<typeof analysisResponseSchema>;
