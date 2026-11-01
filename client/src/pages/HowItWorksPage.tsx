import { Panel } from "../components/ui/Panel";

const steps = [
  {
    number: "01",
    title: "Paste the communication",
    description:
      "Start with the exact wording from an email, announcement, or assessment instruction.",
  },
  {
    number: "02",
    title: "Choose your language",
    description:
      "Select a supported language for the translation and contextual explanation.",
  },
  {
    number: "03",
    title: "Review meaning and actions",
    description:
      "Compare the original, translation, key terms, actions, deadlines, and anything that still needs confirmation.",
  },
] as const;

export function HowItWorksPage() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
      <div className="max-w-3xl">
        <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-mint-700">
          How Lernova works
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.05em] sm:text-6xl">
          More than a direct translation.
        </h1>
        <p className="mt-6 text-lg leading-8 text-ink-600">
          The planned workflow keeps the original wording visible, separates
          translation from explanation, and highlights uncertainty instead of
          inventing missing details.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <Panel key={step.number} className="p-6 sm:p-7">
            <span className="grid size-11 place-items-center rounded-2xl bg-mint-100 text-sm font-extrabold text-mint-700">
              {step.number}
            </span>
            <h2 className="mt-6 text-xl font-bold tracking-[-0.03em]">
              {step.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-600">
              {step.description}
            </p>
          </Panel>
        ))}
      </div>

      <aside className="mt-8 rounded-[1.75rem] border border-coral-500/20 bg-coral-100/55 p-6 sm:p-8">
        <h2 className="text-lg font-bold tracking-[-0.02em]">
          Important information stays visible
        </h2>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-ink-800">
          If a deadline, local term, or university rule is unclear, Lernova is
          intended to say what needs confirming and suggest where to check. It is
          not a replacement for official module guidance.
        </p>
      </aside>
    </section>
  );
}
