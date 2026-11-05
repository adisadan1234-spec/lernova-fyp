import { describe, expect, it } from "vitest";

import { createPlainLanguageMeaning } from "../src/plain-language/plain-language.service.js";

describe("createPlainLanguageMeaning", () => {
  it("restates a directly stated instruction without adding a new action", () => {
    expect(
      createPlainLanguageMeaning(
        "Submit your formative assessment before your next Project Huddle.",
      ),
    ).toEqual({
      directMeaning:
        "You need to submit your formative assessment before your next Project Huddle.",
      interpretation: null,
    });
  });

  it.each([
    [
      "Please ensure that you upload the document prior to Friday.",
      "You need to upload the document before Friday.",
    ],
    [
      "It is mandatory that you attend the session subsequent to induction.",
      "You must attend the session after induction.",
    ],
    [
      "Please note that the seminar will commence at 10:00.",
      "The seminar will start at 10:00.",
    ],
    [
      "In the event that you cannot attend, please contact your tutor.",
      "If you cannot attend, please contact your tutor.",
    ],
  ])("simplifies formal wording in %s", (sourceText, directMeaning) => {
    expect(createPlainLanguageMeaning(sourceText)).toEqual({
      directMeaning,
      interpretation: null,
    });
  });

  it("preserves wording it cannot safely simplify", () => {
    const sourceText =
      "The board may consider the circumstances described in your request.";

    expect(createPlainLanguageMeaning(sourceText)).toEqual({
      directMeaning: sourceText,
      interpretation: null,
    });
  });

  it("preserves source whitespace and line breaks", () => {
    expect(
      createPlainLanguageMeaning(
        "  Please submit the form.\r\n\r\nRead the guidance.  ",
      ),
    ).toEqual({
      directMeaning:
        "  The message asks you to submit the form.\r\n\r\nYou need to read the guidance.  ",
      interpretation: null,
    });
  });
});
