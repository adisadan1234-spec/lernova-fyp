import type { ReactNode } from "react";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-[1.75rem] border border-ink-950/10 bg-white shadow-panel ${className}`}
    >
      {children}
    </section>
  );
}
