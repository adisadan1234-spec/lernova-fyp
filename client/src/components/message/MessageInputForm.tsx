import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { LanguagePreferenceField } from "../language/LanguagePreferenceField";
import {
  getSupportedLanguage,
  readLanguagePreference,
  saveLanguagePreference,
} from "../language/languagePreferences";
import type { SupportedLanguageCode } from "../language/languagePreferences";

export const MAX_MESSAGE_LENGTH = 5_000;

type MessageInputFormProps = {
  onSubmit?: (submission: {
    message: string;
    language: SupportedLanguageCode;
  }) => void;
};

function getMessageError(message: string) {
  if (message.trim().length === 0) {
    return "Enter a university message before continuing.";
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    const excess = message.length - MAX_MESSAGE_LENGTH;
    return `Shorten the message by ${excess.toLocaleString()} ${excess === 1 ? "character" : "characters"}.`;
  }

  return null;
}

export function MessageInputForm({ onSubmit }: MessageInputFormProps) {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState(readLanguagePreference);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOverLimit = message.length > MAX_MESSAGE_LENGTH;
  const hasFormState = message.length > 0 || error !== null || isReady;

  function updateMessage(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextMessage = event.target.value;
    setMessage(nextMessage);
    setIsReady(false);

    if (nextMessage.length > MAX_MESSAGE_LENGTH) {
      setError(getMessageError(nextMessage));
    } else if (error !== null && nextMessage.trim().length > 0) {
      setError(null);
    }
  }

  function clearText() {
    setMessage("");
    setError(null);
    setIsReady(false);
    textareaRef.current?.focus();
  }

  function updateLanguage(nextLanguage: SupportedLanguageCode) {
    setLanguage(nextLanguage);
    setIsReady(false);
    saveLanguagePreference(nextLanguage);
  }

  function resetForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError(null);
    setIsReady(false);
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = getMessageError(message);

    if (validationError) {
      setError(validationError);
      setIsReady(false);
      textareaRef.current?.focus();
      return;
    }

    setError(null);
    setIsReady(true);
    onSubmit?.({ message, language });
  }

  const selectedLanguage = getSupportedLanguage(language);

  const describedBy = [
    "message-help",
    "message-count",
    error ? "message-error" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form className="mt-6" noValidate onReset={resetForm} onSubmit={submitMessage}>
      <LanguagePreferenceField value={language} onChange={updateLanguage} />

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <label htmlFor="university-message" className="text-sm font-bold text-ink-950">
            University message
          </label>
          <p id="message-help" className="mt-1 text-xs leading-5 text-ink-600">
            Paste the original wording so important details stay visible.
          </p>
        </div>
        <button
          type="button"
          disabled={message.length === 0}
          onClick={clearText}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-mint-700 transition-colors hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear text
        </button>
      </div>

      <div
        className={`mt-3 overflow-hidden rounded-2xl border bg-paper-50 transition-colors focus-within:ring-3 ${
          error
            ? "border-red-600 focus-within:border-red-600 focus-within:ring-red-100"
            : "border-ink-950/15 focus-within:border-mint-600 focus-within:ring-mint-100"
        }`}
      >
        <textarea
          ref={textareaRef}
          id="university-message"
          name="message"
          rows={8}
          value={message}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : "false"}
          onChange={updateMessage}
          placeholder="For example: Submit your formative assessment before your next Project Huddle."
          className="block min-h-48 w-full resize-y border-0 bg-transparent px-4 py-4 text-sm leading-6 text-ink-950 outline-none placeholder:text-ink-600/65"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-950/10 bg-white/65 px-4 py-3 text-xs">
          <span className="font-semibold text-ink-600">Plain text only</span>
          <output
            id="message-count"
            htmlFor="university-message"
            className={`font-bold tabular-nums ${isOverLimit ? "text-red-700" : "text-ink-600"}`}
          >
            {message.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()}
          </output>
        </div>
      </div>

      {error ? (
        <p
          id="message-error"
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3.5 py-3 text-sm font-semibold leading-5 text-red-800"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mt-0.5 size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 17h.01" />
          </svg>
          {error}
        </p>
      ) : null}

      {isReady ? (
        <p
          role="status"
          className="mt-3 rounded-xl bg-mint-50 px-3.5 py-3 text-sm font-semibold leading-5 text-mint-700"
        >
          Message ready for explanation in {selectedLanguage.name}. The analysis
          connection will be added in a later task.
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-mint-700"
        >
          Continue to analysis
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <button
          type="reset"
          disabled={!hasFormState}
          className="min-h-12 rounded-xl border border-ink-950/15 px-5 py-3 text-sm font-bold text-ink-800 transition-colors hover:bg-paper-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset form
        </button>
      </div>
    </form>
  );
}
