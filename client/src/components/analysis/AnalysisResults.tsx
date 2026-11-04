import type { AnalysisResponse } from "../../api/analysis";
import { getSupportedLanguage } from "../language/languagePreferences";
import { FeaturePlaceholder } from "../ui/FeaturePlaceholder";

export type AnalysisWorkflowState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; response: AnalysisResponse };

type AnalysisResultsProps = {
  state: AnalysisWorkflowState;
};

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
            Requesting a development fixture
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink-600">
            Lernova is sending the message to the local analysis API.
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
    return <FixtureAnalysis response={state.response} />;
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

function FixtureAnalysis({ response }: { response: AnalysisResponse }) {
  const { data, meta } = response;
  const selectedLanguage = getSupportedLanguage(data.targetLanguage);
  const structuredCounts = [
    ["Academic terms", data.academicTerms.length],
    ["Activity explanations", data.academicImportance.length],
    ["Actions", data.actions.length],
    ["Deadlines", data.deadlines.length],
    ["Engagement opportunities", data.engagementOpportunities.length],
  ] as const;

  return (
    <article aria-labelledby="analysis-result-title" className="p-5 sm:p-7">
      <div
        role="status"
        aria-label="Analysis result status"
        aria-live="polite"
        className="rounded-2xl border border-coral-500/30 bg-coral-100/70 p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-coral-500 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-white">
            Development fixture
          </span>
          <span className="text-xs font-bold text-ink-800">
            No real analysis performed
          </span>
        </div>
        <p id="analysis-result-title" className="mt-3 text-sm font-semibold leading-6 text-ink-950">
          {meta.notice}
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <section className="rounded-2xl border border-ink-950/10 bg-paper-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="m-0 text-sm font-bold text-ink-950">Original message</h3>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-ink-600 shadow-sm">
              Output preference: {selectedLanguage.name}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-800">
            {data.originalText}
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <FixtureContent
            title="Translation"
            text={data.translation.text}
            status={data.translation.status}
          />
          <FixtureContent
            title="Clear meaning"
            text={data.plainLanguageMeaning.text}
            status={data.plainLanguageMeaning.status}
          />
        </div>

        <section className="rounded-2xl border border-ink-950/10 p-4">
          <h3 className="m-0 text-sm font-bold text-ink-950">Structured findings</h3>
          <p className="mt-1 text-xs leading-5 text-ink-600">
            These collections are present in the API contract but intentionally empty in
            Task 8.
          </p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {structuredCounts.map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-xl bg-paper-100 px-3 py-2.5"
              >
                <dt className="text-xs font-semibold text-ink-800">{label}</dt>
                <dd className="m-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-mint-700">
                  {count}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-mint-500/20 bg-mint-50 p-4">
          <h3 className="m-0 text-sm font-bold text-ink-950">What to confirm</h3>
          <div className="mt-3 grid gap-3">
            {data.uncertainties.map((uncertainty) => (
              <div key={`${uncertainty.description}-${uncertainty.clarification}`}>
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
      </div>
    </article>
  );
}

function FixtureContent({
  title,
  text,
  status,
}: {
  title: string;
  text: string;
  status: "fixture" | "generated";
}) {
  return (
    <section className="rounded-2xl border border-dashed border-ink-950/20 bg-paper-100/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-sm font-bold text-ink-950">{title}</h3>
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-coral-500">
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-600">{text}</p>
    </section>
  );
}
