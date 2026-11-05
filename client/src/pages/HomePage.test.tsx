import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { AnalysisResponse } from "../api/analysis";
import { HomePage } from "./HomePage";

const message =
  "Submit your formative assessment before your next Project Huddle.";

const explanationResponse: AnalysisResponse = {
  data: {
    originalText: message,
    targetLanguage: "ur",
    translation: {
      status: "generated",
      text: "اپنے اگلے پروجیکٹ ہڈل سے پہلے اپنی ابتدائی تشخیص جمع کروائیں۔",
    },
    plainLanguageMeaning: {
      status: "generated",
      directMeaning:
        "آپ کو اپنی اگلی پروجیکٹ میٹنگ سے پہلے اپنی تشکیلی جانچ جمع کرنی ہے۔",
      interpretation: null,
    },
    academicTerms: [],
    academicImportance: [],
    actions: [],
    deadlines: [],
    engagementOpportunities: [],
    uncertainties: [
      {
        description:
          "Translation and a source-supported plain-language restatement were generated. Other analysis sections are still in development.",
        clarification:
          "Use the original message as the source of truth and confirm important wording, dates, or module-specific requirements with the relevant university staff member.",
        sourceText: null,
      },
    ],
  },
  meta: {
    mode: "live",
    notice:
      "Translation and a source-supported plain-language restatement were generated. Other analysis sections are still in development.",
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("initial analysis workflow", () => {
  it("sends the selected message, shows loading, and renders the translation response", async () => {
    const user = userEvent.setup();
    const pendingResponse = deferred<Response>();
    const fetchMock = vi.fn().mockReturnValue(pendingResponse.promise);
    vi.stubGlobal("fetch", fetchMock);
    render(<HomePage />);

    await user.selectOptions(screen.getByLabelText("Explanation language"), "ur");
    await user.type(screen.getByLabelText("University message"), message);
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));

    expect(
      screen.getByRole("status", { name: "Analysis request status" }),
    ).toHaveTextContent("Explaining your message");
    expect(
      screen.getByRole("button", { name: "Requesting analysis…" }),
    ).toBeDisabled();

    await act(async () => {
      pendingResponse.resolve(jsonResponse(explanationResponse));
      await pendingResponse.promise;
    });

    expect(
      await screen.findByText("Translation and meaning ready"),
    ).toBeInTheDocument();
    const originalMessageSection = screen
      .getByRole("heading", { name: "Original message" })
      .closest("section");
    expect(originalMessageSection).not.toBeNull();
    expect(within(originalMessageSection as HTMLElement).getByText(message)).toBeInTheDocument();
    expect(screen.getByText("Output language: Urdu")).toBeInTheDocument();
    const translationSection = screen
      .getByRole("heading", { name: "Translation" })
      .closest("section");
    expect(translationSection).not.toBeNull();
    expect(within(translationSection as HTMLElement).getByText(
      "اپنے اگلے پروجیکٹ ہڈل سے پہلے اپنی ابتدائی تشخیص جمع کروائیں۔",
    )).toHaveAttribute("dir", "rtl");
    expect(
      screen.getByRole("heading", { name: "Compare each version" }),
    ).toBeInTheDocument();
    expect(screen.getByText("What to confirm")).toBeInTheDocument();
    const meaningSection = screen
      .getByRole("heading", { name: "Plain-language explanation" })
      .closest("section");
    expect(meaningSection).not.toBeNull();
    expect(
      within(meaningSection as HTMLElement).getByText(
        explanationResponse.data.plainLanguageMeaning.directMeaning,
      ),
    ).toHaveAttribute("dir", "rtl");
    expect(
      within(meaningSection as HTMLElement).getByText(
        "None added. This explanation only uses information directly supported by the message.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation returned")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/analyses");
    expect(options.method).toBe("POST");
    expect(options.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(options.body as string)).toEqual({
      message,
      targetLanguage: "ur",
    });
  });

  it("shows a recoverable server error and preserves the submitted form", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            error: {
              code: "ANALYSIS_UNAVAILABLE",
              message: "The analysis service is temporarily unavailable.",
            },
          },
          false,
        ),
      ),
    );
    render(<HomePage />);

    await user.type(screen.getByLabelText("University message"), message);
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The analysis service is temporarily unavailable.",
    );
    expect(screen.getByLabelText("University message")).toHaveValue(message);
    expect(
      screen.getByRole("button", { name: "Continue to analysis" }),
    ).toBeEnabled();
    expect(screen.getByText("Ready to retry")).toBeInTheDocument();
  });

  it("shows a useful message when the API cannot be reached", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));
    render(<HomePage />);

    await user.type(screen.getByLabelText("University message"), message);
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Lernova could not reach the analysis service. Check that the API is running, then try again.",
    );
  });

  it("clears a previous result when the draft changes", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(explanationResponse)),
    );
    render(<HomePage />);

    await user.selectOptions(screen.getByLabelText("Explanation language"), "ur");
    await user.type(screen.getByLabelText("University message"), message);
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));
    expect(
      await screen.findByText("Translation and meaning ready"),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("University message"), " Updated");

    expect(
      screen.queryByText("Translation and meaning ready"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Clear meaning")).toBeInTheDocument();
    expect(screen.getByText("Ready for input")).toBeInTheDocument();
  });
});

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: vi.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });

  return { promise, resolve };
}
