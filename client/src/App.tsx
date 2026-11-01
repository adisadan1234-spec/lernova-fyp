import { Route, Routes } from "react-router";

import { AppShell } from "./components/layout/AppShell";
import { HomePage } from "./pages/HomePage";
import { HowItWorksPage } from "./pages/HowItWorksPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
      </Route>
    </Routes>
  );
}
