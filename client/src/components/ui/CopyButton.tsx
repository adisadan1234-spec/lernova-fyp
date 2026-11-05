import { useState } from "react";

type CopyButtonProps = {
  label: string;
  text: string;
};

type CopyState = "idle" | "copying" | "copied" | "error";

export function CopyButton({ label, text }: CopyButtonProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  async function copyText() {
    setCopyState("copying");

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }

      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  const buttonText = getButtonText(copyState);
  const accessibleLabel = getAccessibleLabel(label, copyState);
  const statusMessage = getStatusMessage(label, copyState);

  return (
    <div className="shrink-0">
      <button
        type="button"
        aria-label={accessibleLabel}
        disabled={copyState === "copying"}
        onClick={copyText}
        className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition disabled:cursor-wait disabled:opacity-70 ${
          copyState === "error"
            ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
            : copyState === "copied"
              ? "border-mint-500/30 bg-mint-50 text-mint-700"
              : "border-ink-950/10 bg-white text-ink-800 shadow-sm hover:border-mint-500/30 hover:text-mint-700"
        }`}
      >
        <CopyIcon state={copyState} />
        <span>{buttonText}</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {statusMessage}
      </span>
    </div>
  );
}

function CopyIcon({ state }: { state: CopyState }) {
  if (state === "copied") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m4 10 3.5 3.5L16 5" />
      </svg>
    );
  }

  if (state === "error") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="10" cy="10" r="7" />
        <path d="M10 6v5M10 14h.01" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="6.5" y="6.5" width="9" height="9" rx="1.5" />
      <path d="M13.5 6.5v-2a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" />
    </svg>
  );
}

function getButtonText(copyState: CopyState) {
  switch (copyState) {
    case "copying":
      return "Copying…";
    case "copied":
      return "Copied";
    case "error":
      return "Try again";
    default:
      return "Copy";
  }
}

function getAccessibleLabel(label: string, copyState: CopyState) {
  switch (copyState) {
    case "copying":
      return `Copying ${label.toLocaleLowerCase("en-GB")}`;
    case "copied":
      return `${label} copied`;
    case "error":
      return `Copy ${label.toLocaleLowerCase("en-GB")} again`;
    default:
      return `Copy ${label.toLocaleLowerCase("en-GB")}`;
  }
}

function getStatusMessage(label: string, copyState: CopyState) {
  switch (copyState) {
    case "copied":
      return `${label} copied to the clipboard.`;
    case "error":
      return `${label} could not be copied. Try again.`;
    default:
      return "";
  }
}
