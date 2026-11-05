import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AnalysisResponse } from "../../api/analysis";
import { AnalysisResults } from "./AnalysisResults";

const originalText =
  "Submit your formative assessment before your next Project Huddle.";
const translationText =
  "اپنے اگلے پروجیکٹ ہڈل سے پہلے اپنی ابتدائی تشخیص جمع کروائیں۔";
const directMeaning =
  "آپ کو اپنی اگلی پروجیکٹ میٹنگ سے پہلے اپنی تشکیلی جانچ جمع کرنی ہے۔";

const generatedResponse: AnalysisResponse = {
  data: {
    originalText,
    targetLanguage: "ur",
    translation: {
      status: "generated",
      text: translationText,
    },
    plainLanguageMeaning: {
      status: "generated",
      directMeaning,
      interpretation: null,
    },
    academicTerms: [],
    academicImportance: [],
    actions: [],
    deadlines: [],
    engagementOpportunities: [],
    uncertainties: [
      {
        description: "Confirm important wording against the source.",
        clarification: "Ask the relevant university staff member if unsure.",
        sourceText: null,
      },
    ],
  },
  meta: {
    mode: "live",
    notice: "Translation and plain-language meaning were generated.",
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("multilingual analysis results", () => {
  it("presents source, translation, and explanation as a labelled comparison", () => {
    render(
      <AnalysisResults
        state={{ status: "success", response: generatedResponse }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Compare each version" }),
    ).toBeInTheDocument();
    expect(screen.getByText("01 · Source")).toBeInTheDocument();
    expect(screen.getByText("02 · Translation")).toBeInTheDocument();
    expect(screen.getByText("03 · Explanation")).toBeInTheDocument();
    expect(screen.getByText("Output language: Urdu")).toBeInTheDocument();

    const originalSection = getSection("Original message");
    expect(within(originalSection).getByText(originalText)).toHaveAttribute(
      "dir",
      "ltr",
    );
    expect(within(originalSection).getByText(originalText)).toHaveAttribute(
      "lang",
      "en",
    );

    const translationSection = getSection("Translation");
    expect(
      within(translationSection).getByText(translationText),
    ).toHaveAttribute("dir", "rtl");
    expect(
      within(translationSection).getByText(translationText),
    ).toHaveAttribute("lang", "ur");

    const meaningSection = getSection("Plain-language explanation");
    expect(within(meaningSection).getByText(directMeaning)).toHaveAttribute(
      "dir",
      "rtl",
    );
    expect(
      within(meaningSection).getByText(
        "None added. This explanation only uses information directly supported by the message.",
      ),
    ).toBeInTheDocument();
  });

  it("copies each displayed version and announces success", async () => {
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue();
    render(
      <AnalysisResults
        state={{ status: "success", response: generatedResponse }}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Copy original message" }),
    );
    expect(writeText).toHaveBeenLastCalledWith(originalText);
    expect(
      screen.getByRole("button", { name: "Original message copied" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Original message copied to the clipboard."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Copy translation" }));
    expect(writeText).toHaveBeenLastCalledWith(translationText);

    await user.click(
      screen.getByRole("button", {
        name: "Copy plain-language explanation",
      }),
    );
    expect(writeText).toHaveBeenLastCalledWith(directMeaning);
  });

  it("shows recoverable feedback when clipboard access fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("Clipboard blocked"),
    );
    render(
      <AnalysisResults
        state={{ status: "success", response: generatedResponse }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy translation" }));

    expect(
      screen.getByRole("button", { name: "Copy translation again" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Translation could not be copied. Try again."),
    ).toBeInTheDocument();
  });

  it("keeps English development fixtures left-to-right", () => {
    const fixtureResponse: AnalysisResponse = {
      ...generatedResponse,
      data: {
        ...generatedResponse.data,
        translation: {
          status: "fixture",
          text: "Translation is unavailable in mock mode.",
        },
        plainLanguageMeaning: {
          status: "fixture",
          directMeaning: "Explanation is unavailable in mock mode.",
          interpretation: null,
        },
      },
      meta: {
        mode: "mock",
        notice: "Development fixture only.",
      },
    };

    render(
      <AnalysisResults state={{ status: "success", response: fixtureResponse }} />,
    );

    expect(
      screen.getByText("Translation is unavailable in mock mode."),
    ).toHaveAttribute("dir", "ltr");
    expect(
      screen.getByText("Translation is unavailable in mock mode."),
    ).toHaveAttribute("lang", "en");
    expect(screen.getAllByText("Development fixture")).toHaveLength(3);
  });
});

function getSection(heading: string) {
  const section = screen.getByRole("heading", { name: heading }).closest("section");

  expect(section).not.toBeNull();
  return section as HTMLElement;
}
