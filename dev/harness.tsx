import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { HarnessApp } from "@dev/harness-app";
import { createMockPanelContext } from "./mockPanelContext";

import "@/styles/globals.css";

const context = createMockPanelContext();

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <HarnessApp context={context} />
  </StrictMode>,
);
