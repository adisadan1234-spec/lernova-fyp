import type { ReactNode } from "react";

import type { AnalysisResponse } from "../../api/analysis";
import { getSupportedLanguage } from "../language/languagePreferences";
import { CopyButton } from "../ui/CopyButton";
import { FeaturePlaceholder } from "../ui/FeaturePlaceholder";

export type AnalysisWorkflowState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; response: AnalysisResponse };

type AnalysisResultsProps = {
  state: AnalysisWorkflowState;
};

type ContentStatus = "fixture" | "generated";

const idleSections = [
  ["01", "Clear meaning", "A plain-language explanation of the whole message."],
  ["02", "Key terms", "Context for unfamiliar academic words and local labels."],
  ["03", "Your next step", "Required actions, deadlines, and details to confirm."],
] as const;

export function AnalysisResults({ state }: AnalysisResultsProps) {
  if (state.status === "loading") {
    return (
      <div
        role="status"
        aria-label="Analysis request status"
        aria-live="polite"
        className="grid min-h-80 place-items-center p-6 text-center sm:p-8"
      >
        <div className="max-w-sm">
          <span
            aria-hidden="true"
            className="mx-auto block size-10 animate-spin rounded-full border-4 border-mint-100 border-t-mint-600"
          />
          <h3 className="mt-5 text-lg font-bold tracking-[-0.025em] text-ink-950">
            Explaining your message
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink-600">
            Lernova is preparing the translation and plain-language meaning.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="p-5 sm:p-7">
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900"
        >
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-red-700">
            Request not completed
          </p>
          <h3 className="mt-2 text-lg font-bold tracking-[-0.025em]">
            Analysis unavailable
          </h3>
          <p className="mt-2 text-sm leading-6">{state.message}</p>
          <p className="mt-3 text-xs font-semibold leading-5 text-red-800">
            Your message remains in the form so you can try again.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "success") {
    return <AnalysisOutput response={state.response} />;
  }

  return (
    <div className="grid gap-3 p-5 sm:p-7">
      {idleSections.map(([eyebrow, title, description]) => (
        <FeaturePlaceholder
          key={eyebrow}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
      ))}
    </div>
  );
}

function AnalysisOutput({ response }: { response: AnalysisResponse }) {
  const { data, meta } = response;
  const selectedLanguage = getSupportedLanguage(data.targetLanguage);
  const fallbackLanguage = getSupportedLanguage("en");
  const translationLanguage =
    data.translation.status === "generated"
      ? selectedLanguage
      : fallbackLanguage;
  const meaningLanguage =
    data.plainLanguageMeaning.status === "generated"
      ? selectedLanguage
      : fallbackLanguage;
  const explanationReady =
    meta.mode === "live" &&
    data.translation.status === "generated" &&
    data.plainLanguageMeaning.status === "generated";

  return (
    <article aria-labelledby="message-comparison-title" className="p-5 sm:p-7">
      <ResultStatus ready={explanationReady} notice={meta.notice} />

      <section className="mt-6" aria-labelledby="message-comparison-title">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-mint-700">
              Message comparison
            </p>
            <h3
              id="message-comparison-title"
              className="mt-2 text-xl font-bold tracking-[-0.03em] text-ink-950"
            >
              Compare each version
            </h3>
          </div>
          <p className="m-0 text-xs font-semibold text-ink-600">
            Output language: {selectedLanguage.name}
          </p>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-600">
          Keep the source beside the translated and simplified versions so you can
          check important wording.
        </p>

        <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2">
          <ResultCard
            className="sm:col-span-2"
            eyebrow="01 · Source"
            title="Original message"
            badge="English source"
            copyLabel="Original message"
            copyText={data.originalText}
            tone="source"
          >
            <ResultText
              text={data.originalText}
              lang="en"
              direction="ltr"
            />
          </ResultCard>

          <ResultCard
            eyebrow="02 · Translation"
            title="Translation"
            badge={getContentBadge(data.translation.status)}
            copyLabel="Translation"
            copyText={data.translation.text}
            status={data.translation.status}
            tone="translation"
          >
            <ResultText
              text={data.translation.text}
              lang={translationLanguage.code}
              direction={translationLanguage.direction}
            />
          </ResultCard>

          <PlainLanguageMeaningCard
            meaning={data.plainLanguageMeaning}
            lang={meaningLanguage.code}
            direction={meaningLanguage.direction}
          />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-mint-500/20 bg-mint-50 p-4 sm:p-5">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-mint-700">
          Check before acting
        </p>
        <h3 className="mt-2 text-base font-bold text-ink-950">What to confirm</h3>
        <div className="mt-3 grid gap-3">
          {data.uncertainties.map((uncertainty) => (
            <div
              key={`${uncertainty.description}-${uncertainty.clarification}`}
              className="rounded-xl bg-white/80 px-3.5 py-3"
            >
              <p className="m-0 text-sm font-semibold leading-6 text-ink-800">
                {uncertainty.description}
              </p>
              <p className="mt-1 text-xs leading-5 text-ink-600">
                {uncertainty.clarification}
              </p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}

function ResultStatus({ ready, notice }: { ready: boolean; notice: string }) {
  return (
    <div
      role="status"
      aria-label="Analysis result status"
      aria-live="polite"
      className={`rounded-2xl border p-4 ${
        ready
          ? "border-mint-500/30 bg-mint-50"
          : "border-coral-500/30 bg-coral-100/70"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white ${
            ready ? "bg-mint-700" : "bg-coral-500"
          }`}
        >
          {ready ? "Translation and meaning ready" : "Development fixture"}
        </span>
        <span className="text-xs font-bold text-ink-800">
          {ready
            ? "More contextual findings will be added in later tasks"
            : "No real analysis performed"}
        </span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-ink-950">
        {notice}
      </p>
    </div>
  );
}

function PlainLanguageMeaningCard({
  meaning,
  lang,
  direction,
}: {
  meaning: AnalysisResponse["data"]["plainLanguageMeaning"];
  lang: string;
  direction: "ltr" | "rtl";
}) {
  return (
    <ResultCard
      eyebrow="03 · Explanation"
      title="Plain-language explanation"
      badge={getContentBadge(meaning.status)}
      copyLabel="Plain-language explanation"
      copyText={createMeaningCopyText(meaning)}
      status={meaning.status}
      tone="meaning"
    >
      <div>
        <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-mint-700">
          Direct meaning
        </p>
        <ResultText
          text={meaning.directMeaning}
          lang={lang}
          direction={direction}
          className="mt-2"
        />
      </div>
      <div className="mt-5 border-t border-ink-950/10 pt-4">
        <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-ink-600">
          Additional interpretation
        </p>
        {meaning.interpretation ? (
          <ResultText
            text={meaning.interpretation}
            lang={lang}
            direction={direction}
            className="mt-2 text-sm leading-6"
          />
        ) : (
          <p className="mt-2 text-xs leading-5 text-ink-600">
            None added. This explanation only uses information directly supported
            by the message.
          </p>
        )}
      </div>
    </ResultCard>
  );
}

function ResultCard({
  eyebrow,
  title,
  badge,
  copyLabel,
  copyText,
  status,
  tone,
  className = "",
  children,
}: {
  eyebrow: string;
  title: string;
  badge: string;
  copyLabel: string;
  copyText: string;
  status?: ContentStatus;
  tone: "source" | "translation" | "meaning";
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${copyLabel.toLocaleLowerCase("en-GB").replaceAll(" ", "-")}-title`;

  return (
    <section
      aria-labelledby={headingId}
      className={`flex min-w-0 flex-col rounded-2xl border p-4 sm:p-5 ${getCardTone(
        tone,
        status,
      )} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-coral-500">
            {eyebrow}
          </p>
          <h3
            id={headingId}
            className="mt-1.5 text-base font-bold tracking-[-0.02em] text-ink-950"
          >
            {title}
          </h3>
        </div>
        <CopyButton label={copyLabel} text={copyText} />
      </div>
      <div className="mt-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.1em] ${getBadgeTone(
            status,
          )}`}
        >
          {badge}
        </span>
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

function ResultText({
  text,
  lang,
  direction,
  className = "",
}: {
  text: string;
  lang: string;
  direction: "ltr" | "rtl";
  className?: string;
}) {
  return (
    <p
      lang={lang}
      dir={direction}
      className={`whitespace-pre-wrap break-words text-base leading-7 text-ink-800 ${
        direction === "rtl" ? "text-right" : "text-left"
      } ${className}`}
    >
      {text}
    </p>
  );
}

function createMeaningCopyText(
  meaning: AnalysisResponse["data"]["plainLanguageMeaning"],
) {
  return meaning.interpretation
    ? `${meaning.directMeaning}\n\n${meaning.interpretation}`
    : meaning.directMeaning;
}

function getContentBadge(status: ContentStatus) {
  return status === "generated" ? "Ready" : "Development fixture";
}

function getCardTone(
  tone: "source" | "translation" | "meaning",
  status?: ContentStatus,
) {
  if (status === "fixture") {
    return "border-dashed border-ink-950/20 bg-paper-100/80";
  }

  switch (tone) {
    case "source":
      return "border-ink-950/10 bg-paper-100/70";
    case "meaning":
      return "border-mint-500/30 bg-mint-50/70";
    default:
      return "border-mint-500/30 bg-white";
  }
}

function getBadgeTone(status?: ContentStatus) {
  if (status === "fixture") {
    return "bg-coral-100 text-coral-500";
  }

  if (status === "generated") {
    return "bg-mint-100 text-mint-700";
  }

  return "bg-white text-ink-600 shadow-sm";
}
