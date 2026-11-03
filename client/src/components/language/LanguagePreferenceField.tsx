import { useId } from "react";
import type { ChangeEvent } from "react";

import {
  getSupportedLanguage,
  isSupportedLanguageCode,
  supportedLanguages,
} from "./languagePreferences";
import type { SupportedLanguageCode } from "./languagePreferences";

type LanguagePreferenceFieldProps = {
  value: SupportedLanguageCode;
  onChange: (language: SupportedLanguageCode) => void;
};

export function LanguagePreferenceField({
  value,
  onChange,
}: LanguagePreferenceFieldProps) {
  const fieldId = useId();
  const selectId = `${fieldId}-select`;
  const helpId = `${fieldId}-help`;
  const selectedLanguage = getSupportedLanguage(value);

  function updateLanguage(event: ChangeEvent<HTMLSelectElement>) {
    const nextLanguage = event.target.value;

    if (isSupportedLanguageCode(nextLanguage)) {
      onChange(nextLanguage);
    }
  }

  return (
    <div className="rounded-2xl border border-ink-950/10 bg-mint-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <label htmlFor={selectId} className="text-sm font-bold text-ink-950">
            Explanation language
          </label>
          <p id={helpId} className="mt-1 text-xs leading-5 text-ink-600">
            Choose the language for future translation and contextual guidance.
            This preference is saved in this browser.
          </p>
        </div>

        <div className="relative shrink-0 sm:w-48">
          <select
            id={selectId}
            name="language"
            value={value}
            lang={selectedLanguage.code}
            dir={selectedLanguage.direction}
            aria-describedby={helpId}
            onChange={updateLanguage}
            className="min-h-11 w-full appearance-none rounded-xl border border-ink-950/15 bg-white py-2.5 pl-3 pr-10 text-sm font-bold text-ink-950 shadow-sm"
          >
            {supportedLanguages.map((language) => (
              <option
                key={language.code}
                value={language.code}
                lang={language.code}
                dir={language.direction}
              >
                {language.name === language.nativeName
                  ? language.name
                  : `${language.name} — ${language.nativeName}`}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-600"
            fill="currentColor"
          >
            <path d="m5.4 7.5 4.6 4.6 4.6-4.6 1.4 1.4-6 6-6-6 1.4-1.4Z" />
          </svg>
        </div>
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-950/10 pt-3 text-xs text-ink-600">
        <span className="font-semibold">Selected output</span>
        <span
          className="rounded-full bg-white px-2.5 py-1 font-bold text-mint-700 shadow-sm"
          lang={selectedLanguage.code}
          dir={selectedLanguage.direction}
        >
          {selectedLanguage.nativeName}
        </span>
        <span>
          {selectedLanguage.direction === "rtl"
            ? "Right-to-left text"
            : "Left-to-right text"}
        </span>
      </p>
    </div>
  );
}
