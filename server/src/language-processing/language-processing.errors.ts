export abstract class LanguageProcessingError extends Error {
  abstract readonly code:
    | "PROVIDER_UNAVAILABLE"
    | "PROVIDER_TIMEOUT"
    | "INVALID_PROVIDER_RESPONSE";
}

export class ProviderUnavailableError extends LanguageProcessingError {
  readonly code = "PROVIDER_UNAVAILABLE" as const;

  constructor(options?: ErrorOptions) {
    super("The language-processing provider is unavailable.", options);
    this.name = "ProviderUnavailableError";
  }
}

export class ProviderTimeoutError extends LanguageProcessingError {
  readonly code = "PROVIDER_TIMEOUT" as const;

  constructor() {
    super("The language-processing provider timed out.");
    this.name = "ProviderTimeoutError";
  }
}

export class InvalidProviderResponseError extends LanguageProcessingError {
  readonly code = "INVALID_PROVIDER_RESPONSE" as const;

  constructor(options?: ErrorOptions) {
    super("The language-processing provider returned an invalid response.", options);
    this.name = "InvalidProviderResponseError";
  }
}
