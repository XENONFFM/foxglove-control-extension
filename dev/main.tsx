import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Harness } from "@dev/harness";
import { createMockPanelContext } from "./mockPanelContext";

import "@/styles/globals.css";

const context = createMockPanelContext();

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Harness context={context} />
  </StrictMode>,
);
