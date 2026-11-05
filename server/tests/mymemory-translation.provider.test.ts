import { describe, expect, it, vi } from "vitest";

import { InvalidProviderResponseError } from "../src/language-processing/language-processing.errors.js";
import {
  createTranslationSegments,
  MyMemoryTranslationProvider,
} from "../src/language-processing/providers/mymemory-translation.provider.js";

const context = { signal: new AbortController().signal };

describe("MyMemoryTranslationProvider", () => {
  it("keeps an English target local and preserves the source text", async () => {
    const fetchMock = vi.fn();
    const provider = new MyMemoryTranslationProvider(
      fetchMock as unknown as typeof fetch,
    );
    const sourceText = "  Attend the seminar tomorrow.\n";

    await expect(
      provider.process({ sourceText, targetLanguage: "en" }, context),
    ).resolves.toMatchObject({
      translation: {
        status: "generated",
        text: sourceText,
      },
      plainLanguageMeaning: {
        status: "generated",
        directMeaning: "  You need to attend the seminar tomorrow.\n",
        interpretation: null,
      },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("translates an English message into Urdu without an API key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        responseData: {
          translatedText:
            "اپنے اگلے پروجیکٹ ہڈل سے پہلے اپنی ابتدائی تشخیص جمع کروائیں۔",
        },
        responseStatus: 200,
      }),
    );
    const provider = new MyMemoryTranslationProvider(
      fetchMock as unknown as typeof fetch,
    );

    const output = await provider.process(
      {
        sourceText:
          "Submit your formative assessment before your next Project Huddle.",
        targetLanguage: "ur",
      },
      context,
    );

    expect(output).toMatchObject({
      translation: {
        status: "generated",
        text: "اپنے اگلے پروجیکٹ ہڈل سے پہلے اپنی ابتدائی تشخیص جمع کروائیں۔",
      },
      plainLanguageMeaning: {
        status: "generated",
        interpretation: null,
      },
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const requestUrl = fetchMock.mock.calls[0]?.[0];
    expect(requestUrl).toBeInstanceOf(URL);
    expect((requestUrl as URL).searchParams.get("langpair")).toBe("en|ur");
    expect((requestUrl as URL).searchParams.get("mt")).toBe("1");
    expect((requestUrl as URL).searchParams.has("api_key")).toBe(false);

    const meaningRequestUrl = fetchMock.mock.calls[1]?.[0];
    expect(meaningRequestUrl).toBeInstanceOf(URL);
    expect((meaningRequestUrl as URL).searchParams.get("q")).toBe(
      "You need to submit your formative assessment before your next Project Huddle.",
    );
  });

  it("splits long input below the provider byte limit and preserves line breaks", async () => {
    const sourceText = `${"word ".repeat(120).trim()}\n\nSecond line.`;
    const segments = createTranslationSegments(sourceText);
    const translatableSegments = segments.filter(
      (segment) => segment.kind === "translate",
    );

    expect(translatableSegments.length).toBeGreaterThan(1);
    expect(
      translatableSegments.every(
        (segment) => Buffer.byteLength(segment.text, "utf8") <= 450,
      ),
    ).toBe(true);
    expect(
      segments
        .filter((segment) => segment.kind === "separator")
        .map((segment) => segment.text)
        .join(""),
    ).toContain("\n\n");
  });

  it("rejects malformed external output before it reaches the analysis response", async () => {
    const provider = new MyMemoryTranslationProvider(
      vi.fn()
        .mockResolvedValue(jsonResponse({ responseStatus: 200 })) as unknown as typeof fetch,
    );

    await expect(
      provider.process(
        { sourceText: "Attend the seminar.", targetLanguage: "ur" },
        context,
      ),
    ).rejects.toBeInstanceOf(InvalidProviderResponseError);
  });

  it("forwards the service abort signal to the external request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        responseData: { translatedText: "سیمینار میں شرکت کریں۔" },
        responseStatus: 200,
      }),
    );
    const provider = new MyMemoryTranslationProvider(
      fetchMock as unknown as typeof fetch,
    );

    await provider.process(
      { sourceText: "Attend the seminar.", targetLanguage: "ur" },
      context,
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mock.calls.forEach((call) => {
      expect(call[1]).toMatchObject({ signal: context.signal });
    });
  });
});

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}
