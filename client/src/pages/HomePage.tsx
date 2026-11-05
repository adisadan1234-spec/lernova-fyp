import { useEffect, useRef, useState } from "react";

import {
  AnalysisRequestError,
  requestAnalysis,
} from "../api/analysis";
import {
  AnalysisResults,
  type AnalysisWorkflowState,
} from "../components/analysis/AnalysisResults";
import { MessageInputForm } from "../components/message/MessageInputForm";
import { Panel } from "../components/ui/Panel";

export function HomePage() {
  const [analysisState, setAnalysisState] = useState<AnalysisWorkflowState>({
    status: "idle",
  });
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestControllerRef.current?.abort();
  }, []);

  async function submitForAnalysis({
    message,
    language,
  }: {
    message: string;
    language: "en" | "ur";
  }) {
    requestControllerRef.current?.abort();
    const requestController = new AbortController();
    requestControllerRef.current = requestController;
    setAnalysisState({ status: "loading" });

    try {
      const response = await requestAnalysis(
        { message, targetLanguage: language },
        requestController.signal,
      );

      if (!requestController.signal.aborted) {
        setAnalysisState({ status: "success", response });
      }
    } catch (error) {
      if (!requestController.signal.aborted) {
        setAnalysisState({
          status: "error",
          message:
            error instanceof AnalysisRequestError
              ? error.message
              : "The analysis request could not be completed. Please try again.",
        });
      }
    } finally {
      if (requestControllerRef.current === requestController) {
        requestControllerRef.current = null;
      }
    }
  }

  function clearAnalysis() {
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
    setAnalysisState({ status: "idle" });
  }

  const formStatus = getFormStatus(analysisState.status);

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
            Live Urdu output sends the message and its locally simplified
            restatement to the free MyMemory service. Remove unnecessary personal
            information before submitting.
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
              <span className="rounded-full bg-mint-100 px-3 py-1.5 text-xs font-semibold text-mint-700">
                {formStatus}
              </span>
            </div>
            <MessageInputForm
              isSubmitting={analysisState.status === "loading"}
              onDraftChange={clearAnalysis}
              onReset={clearAnalysis}
              onSubmit={submitForAnalysis}
            />
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
            <AnalysisResults state={analysisState} />
          </Panel>
        </div>
      </section>
    </>
  );
}

function getFormStatus(status: AnalysisWorkflowState["status"]) {
  switch (status) {
    case "loading":
      return "Request in progress";
    case "success":
      return "Explanation returned";
    case "error":
      return "Ready to retry";
    default:
      return "Ready for input";
  }
}
