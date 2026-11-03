import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LANGUAGE_PREFERENCE_STORAGE_KEY } from "../language/languagePreferences";
import { MAX_MESSAGE_LENGTH, MessageInputForm } from "./MessageInputForm";

describe("MessageInputForm", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts with an accessible empty message field and character count", () => {
    render(<MessageInputForm />);

    expect(screen.getByLabelText("Explanation language")).toHaveValue("en");
    expect(screen.getByLabelText("University message")).toHaveValue("");
    expect(screen.getByText("0 / 5,000")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue to analysis" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Clear text" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Reset form" })).toBeDisabled();
  });

  it("updates the character count as the user types", async () => {
    const user = userEvent.setup();
    render(<MessageInputForm />);

    await user.type(screen.getByLabelText("University message"), "Formative task");

    expect(screen.getByText("14 / 5,000")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear text" })).toBeEnabled();
  });

  it("rejects a whitespace-only message and focuses the field", async () => {
    const user = userEvent.setup();
    render(<MessageInputForm />);
    const messageField = screen.getByLabelText("University message");

    await user.type(messageField, "   ");
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a university message before continuing.",
    );
    expect(messageField).toHaveAttribute("aria-invalid", "true");
    expect(messageField).toHaveFocus();
  });

  it("rejects messages over the maximum length", () => {
    render(<MessageInputForm />);
    const messageField = screen.getByLabelText("University message");

    fireEvent.change(messageField, {
      target: { value: "a".repeat(MAX_MESSAGE_LENGTH + 2) },
    });

    expect(screen.getByText("5,002 / 5,000")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Shorten the message by 2 characters.",
    );
    expect(messageField).toHaveAttribute("aria-invalid", "true");
  });

  it("submits a valid message unchanged and shows an honest ready state", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MessageInputForm onSubmit={onSubmit} />);
    const message = "  Submit your formative assessment tomorrow.  ";

    await user.type(screen.getByLabelText("University message"), message);
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));

    expect(onSubmit).toHaveBeenCalledWith({ message, language: "en" });
    expect(
      screen.getByText(
        "Message ready for explanation in English. The analysis connection will be added in a later task.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears the text and returns focus to the message field", async () => {
    const user = userEvent.setup();
    render(<MessageInputForm />);
    const messageField = screen.getByLabelText("University message");

    await user.type(messageField, "Please attend the project meeting.");
    await user.click(screen.getByRole("button", { name: "Clear text" }));

    expect(messageField).toHaveValue("");
    expect(messageField).toHaveFocus();
    expect(screen.getByText("0 / 5,000")).toBeInTheDocument();
  });

  it("resets the message and submission state", async () => {
    const user = userEvent.setup();
    render(<MessageInputForm />);
    const messageField = screen.getByLabelText("University message");

    await user.type(messageField, "Complete the task before Friday.");
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));
    await user.click(screen.getByRole("button", { name: "Reset form" }));

    expect(messageField).toHaveValue("");
    expect(screen.getByText("0 / 5,000")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Message ready for explanation in English. The analysis connection will be added in a later task.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset form" })).toBeDisabled();
  });

  it("offers the configured English and Urdu preferences", () => {
    render(<MessageInputForm />);

    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("option", { name: "English" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Urdu — اردو" }),
    ).toBeInTheDocument();
  });

  it("saves Urdu and applies right-to-left metadata", async () => {
    const user = userEvent.setup();
    render(<MessageInputForm />);
    const languageField = screen.getByLabelText("Explanation language");

    await user.selectOptions(languageField, "ur");

    expect(languageField).toHaveValue("ur");
    expect(languageField).toHaveAttribute("lang", "ur");
    expect(languageField).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("اردو", { selector: "span" })).toHaveAttribute(
      "dir",
      "rtl",
    );
    expect(window.localStorage.getItem(LANGUAGE_PREFERENCE_STORAGE_KEY)).toBe(
      "ur",
    );
  });

  it("restores a supported saved language and ignores an unsupported value", () => {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_STORAGE_KEY, "ur");
    const { unmount } = render(<MessageInputForm />);

    expect(screen.getByLabelText("Explanation language")).toHaveValue("ur");

    unmount();
    window.localStorage.setItem(LANGUAGE_PREFERENCE_STORAGE_KEY, "unsupported");
    render(<MessageInputForm />);

    expect(screen.getByLabelText("Explanation language")).toHaveValue("en");
  });

  it("submits the selected language and preserves it when the form resets", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MessageInputForm onSubmit={onSubmit} />);

    await user.selectOptions(screen.getByLabelText("Explanation language"), "ur");
    await user.type(
      screen.getByLabelText("University message"),
      "Submit the assessment before Friday.",
    );
    await user.click(screen.getByRole("button", { name: "Continue to analysis" }));

    expect(onSubmit).toHaveBeenCalledWith({
      message: "Submit the assessment before Friday.",
      language: "ur",
    });

    await user.click(screen.getByRole("button", { name: "Reset form" }));

    expect(screen.getByLabelText("Explanation language")).toHaveValue("ur");
    expect(screen.getByLabelText("University message")).toHaveValue("");
  });
});
