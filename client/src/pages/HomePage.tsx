import { FeaturePlaceholder } from "../components/ui/FeaturePlaceholder";
import { Panel } from "../components/ui/Panel";

const resultSections = [
  ["01", "Clear meaning", "A plain-language explanation of the whole message."],
  ["02", "Key terms", "Context for unfamiliar academic words and local labels."],
  ["03", "Your next step", "Required actions, deadlines, and details to confirm."],
] as const;

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-ink-950/10 bg-mint-50">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-24 size-80 rounded-full border-[52px] border-white/45"
        />
        <div className="relative mx-auto grid w-full max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:px-10 lg:py-20">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-mint-500/20 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-mint-700 shadow-sm">
              <span className="size-2 rounded-full bg-coral-500" />
              University messages, made clearer
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-[1.04] tracking-[-0.055em] text-ink-950 sm:text-6xl lg:text-7xl">
              From university wording to a clear next step.
            </h1>
          </div>

          <div className="max-w-xl lg:justify-self-end">
            <p className="m-0 text-lg leading-8 text-ink-800 sm:text-xl">
              Lernova is being designed to translate university communications,
              explain academic terms, and show what you may need to do next.
            </p>
            <div className="mt-6 flex items-start gap-3 border-l-2 border-coral-500 pl-4 text-sm leading-6 text-ink-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="mt-0.5 size-5 shrink-0 text-coral-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span>
                Lernova supports understanding. Always confirm important dates or
                module-specific rules with your university.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-mint-700">
              Message workspace
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">
              Understand the message in one place
            </h2>
          </div>
          <p className="m-0 max-w-md text-sm leading-6 text-ink-600">
            The input and analysis workflow is being added incrementally.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <Panel className="p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-coral-500">
                  Step 1
                </p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                  Add your message
                </h2>
              </div>
              <span className="rounded-full bg-paper-100 px-3 py-1.5 text-xs font-semibold text-ink-600">
                Input coming next
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-ink-950/15 bg-paper-50 p-4">
              <p className="m-0 min-h-32 text-sm leading-6 text-ink-600">
                Paste an email, announcement, or assessment instruction here…
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-ink-950/10 pt-3 text-xs font-semibold text-ink-600">
                <span>University communication</span>
                <span>0 / 5,000</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-xl bg-ink-950 px-5 py-3 text-sm font-bold text-white opacity-45">
                Analyse message
              </span>
              <span className="rounded-xl border border-ink-950/15 px-5 py-3 text-sm font-bold text-ink-600 opacity-60">
                Clear
              </span>
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="border-b border-ink-950/10 bg-ink-950 px-5 py-5 text-white sm:px-7">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-mint-100">
                Step 2
              </p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.03em]">
                Your explanation
              </h2>
            </div>
            <div className="grid gap-3 p-5 sm:p-7">
              {resultSections.map(([eyebrow, title, description]) => (
                <FeaturePlaceholder
                  key={eyebrow}
                  eyebrow={eyebrow}
                  title={title}
                  description={description}
                />
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </>
  );
}
