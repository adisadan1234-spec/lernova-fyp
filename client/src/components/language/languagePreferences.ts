export const LANGUAGE_PREFERENCE_STORAGE_KEY =
  "lernova.preferred-explanation-language";

export const supportedLanguages = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    direction: "ltr",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    direction: "rtl",
  },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];
export type SupportedLanguageCode = SupportedLanguage["code"];

export const DEFAULT_LANGUAGE_CODE: SupportedLanguageCode = "en";

export function isSupportedLanguageCode(
  value: string | null,
): value is SupportedLanguageCode {
  return supportedLanguages.some((language) => language.code === value);
}

export function getSupportedLanguage(
  code: SupportedLanguageCode,
): SupportedLanguage {
  return (
    supportedLanguages.find((language) => language.code === code) ??
    supportedLanguages[0]
  );
}

export function readLanguagePreference(): SupportedLanguageCode {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE_CODE;
  }

  try {
    const storedLanguage = window.localStorage.getItem(
      LANGUAGE_PREFERENCE_STORAGE_KEY,
    );

    return isSupportedLanguageCode(storedLanguage)
      ? storedLanguage
      : DEFAULT_LANGUAGE_CODE;
  } catch {
    return DEFAULT_LANGUAGE_CODE;
  }
}

export function saveLanguagePreference(code: SupportedLanguageCode) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LANGUAGE_PREFERENCE_STORAGE_KEY, code);
  } catch {
    // A blocked storage API should not prevent the user from continuing.
  }
}
