import { NavLink, Outlet } from "react-router";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-full px-3 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-ink-950 text-white"
      : "text-ink-600 hover:bg-mint-100 hover:text-ink-950",
  ].join(" ");

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 place-items-center rounded-[0.9rem] bg-ink-950 text-white shadow-sm"
    >
      <svg viewBox="0 0 32 32" className="size-6" fill="none">
        <path
          d="M8 7.5v14.2c0 1.6 1.3 2.8 2.8 2.8H24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="m11 17 4-4 3 3 6-7"
          stroke="#72D4A7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    </span>
  );
}

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-paper-50 text-ink-950">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-3 font-semibold shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <header className="border-b border-ink-950/10 bg-paper-50/95">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
          <NavLink
            to="/"
            aria-label="Lernova home"
            className="flex items-center gap-3 rounded-lg"
          >
            <BrandMark />
            <span>
              <span className="block text-lg font-bold leading-none tracking-[-0.03em]">
                Lernova
              </span>
              <span className="mt-1 block text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-600">
                Understand. Act. Engage.
              </span>
            </span>
          </NavLink>

          <nav aria-label="Primary navigation" className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClassName}>
              Analyse a message
            </NavLink>
            <NavLink to="/how-it-works" className={navLinkClassName}>
              How it works
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-950/10 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-7 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p className="m-0 font-semibold text-ink-800">
            Lernova · A Kingston University final-year project
          </p>
          <p className="m-0">Guidance support, not an official university service.</p>
        </div>
      </footer>
    </div>
  );
}
