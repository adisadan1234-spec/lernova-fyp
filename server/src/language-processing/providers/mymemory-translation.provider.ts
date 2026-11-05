import { z } from "zod";

import { InvalidProviderResponseError } from "../language-processing.errors.js";
import type {
  LanguageProcessingContext,
  LanguageProcessingProvider,
  LanguageProcessingRequest,
} from "../language-processing.provider.js";
import { createPlainLanguageMeaning } from "../../plain-language/plain-language.service.js";

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";
const MYMEMORY_QUERY_BYTE_LIMIT = 500;
const TRANSLATION_CHUNK_BYTE_LIMIT = 450;

const myMemoryResponseSchema = z.object({
  responseData: z.object({
    translatedText: z.string().trim().min(1),
  }),
  responseStatus: z.union([z.number(), z.string()]),
});

type TranslationSegment =
  | { kind: "translate"; text: string }
  | { kind: "separator"; text: string };

export class MyMemoryTranslationProvider
  implements LanguageProcessingProvider
{
  readonly id = "mymemory";

  constructor(
    private readonly fetchImplementation: typeof fetch = fetch,
    private readonly endpoint = MYMEMORY_ENDPOINT,
  ) {}

  async process(
    request: LanguageProcessingRequest,
    context: LanguageProcessingContext,
  ): Promise<unknown> {
    if (context.signal.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    const plainLanguageMeaning = createPlainLanguageMeaning(request.sourceText);

    if (request.targetLanguage === "en") {
      return {
        translation: {
          status: "generated",
          text: request.sourceText,
        },
        plainLanguageMeaning: {
          status: "generated",
          ...plainLanguageMeaning,
        },
        notice:
          "English is selected, so the original message is shown unchanged and a source-supported plain-language restatement was generated locally. No additional interpretation has been added.",
      };
    }

    const [translation, directMeaning, interpretation] = await Promise.all([
      this.translateText(request.sourceText, context.signal),
      this.translateText(plainLanguageMeaning.directMeaning, context.signal),
      plainLanguageMeaning.interpretation
        ? this.translateText(plainLanguageMeaning.interpretation, context.signal)
        : Promise.resolve(null),
    ]);

    return {
      translation: {
        status: "generated",
        text: translation,
      },
      plainLanguageMeaning: {
        status: "generated",
        directMeaning,
        interpretation,
      },
      notice:
        "Translation and a source-supported plain-language restatement were generated using the free MyMemory API. No additional interpretation has been added; confirm important wording against the original message.",
    };
  }

  private async translateText(text: string, signal: AbortSignal) {
    const segments = createTranslationSegments(text);
    const translatedSegments = await Promise.all(
      segments.map(async (segment) => {
        if (segment.kind === "separator") {
          return segment.text;
        }

        return this.translateSegment(segment.text, signal);
      }),
    );

    return translatedSegments.join("");
  }

  private async translateSegment(text: string, signal: AbortSignal) {
    if (Buffer.byteLength(text, "utf8") > MYMEMORY_QUERY_BYTE_LIMIT) {
      throw new InvalidProviderResponseError();
    }

    const requestUrl = new URL(this.endpoint);
    requestUrl.searchParams.set("q", text);
    requestUrl.searchParams.set("langpair", "en|ur");
    requestUrl.searchParams.set("mt", "1");

    const response = await this.fetchImplementation(requestUrl, {
      headers: { Accept: "application/json" },
      signal,
    });

    if (!response.ok) {
      throw new Error(`MyMemory returned HTTP ${response.status}.`);
    }

    let responseBody: unknown;

    try {
      responseBody = await response.json();
    } catch (error) {
      throw new InvalidProviderResponseError({ cause: error });
    }

    const parsedResponse = myMemoryResponseSchema.safeParse(responseBody);

    if (
      !parsedResponse.success ||
      Number(parsedResponse.data.responseStatus) !== 200
    ) {
      throw new InvalidProviderResponseError({
        cause: parsedResponse.success ? undefined : parsedResponse.error,
      });
    }

    return parsedResponse.data.responseData.translatedText;
  }
}

export function createTranslationSegments(
  sourceText: string,
): TranslationSegment[] {
  return sourceText
    .split(/(\r\n|\r|\n)/u)
    .flatMap<TranslationSegment>((line) => {
      if (/^(\r\n|\r|\n)$/u.test(line) || line.trim().length === 0) {
        return [{ kind: "separator", text: line }];
      }

      const leadingWhitespace = line.match(/^\s*/u)?.[0] ?? "";
      const trailingWhitespace = line.match(/\s*$/u)?.[0] ?? "";
      const translatableText = line.trim();
      const chunks = splitByUtf8ByteLimit(
        translatableText,
        TRANSLATION_CHUNK_BYTE_LIMIT,
      );
      const segments: TranslationSegment[] = [];

      if (leadingWhitespace) {
        segments.push({ kind: "separator", text: leadingWhitespace });
      }

      chunks.forEach((chunk, index) => {
        if (index > 0) {
          segments.push({ kind: "separator", text: " " });
        }

        segments.push({ kind: "translate", text: chunk });
      });

      if (trailingWhitespace) {
        segments.push({ kind: "separator", text: trailingWhitespace });
      }

      return segments;
    });
}

function splitByUtf8ByteLimit(text: string, byteLimit: number) {
  const chunks: string[] = [];
  let remainingText = text.trim();

  while (Buffer.byteLength(remainingText, "utf8") > byteLimit) {
    let bytes = 0;
    let splitIndex = 0;
    let lastWhitespaceIndex = -1;

    for (const character of remainingText) {
      const characterBytes = Buffer.byteLength(character, "utf8");

      if (bytes + characterBytes > byteLimit) {
        break;
      }

      bytes += characterBytes;
      splitIndex += character.length;

      if (/\s/u.test(character)) {
        lastWhitespaceIndex = splitIndex;
      }
    }

    const chunkEnd = lastWhitespaceIndex > 0 ? lastWhitespaceIndex : splitIndex;
    const chunk = remainingText.slice(0, chunkEnd).trim();

    if (chunk.length === 0 || chunkEnd === 0) {
      throw new InvalidProviderResponseError();
    }

    chunks.push(chunk);
    remainingText = remainingText.slice(chunkEnd).trimStart();
  }

  if (remainingText.length > 0) {
    chunks.push(remainingText);
  }

  return chunks;
}
