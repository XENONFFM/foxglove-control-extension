import React from "react";
import { createRoot } from "react-dom/client";

import { createMockPanelContext } from "./mockPanelContext";
import { JoyPanel } from "../src/components/JoyPanel";
import "./styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
const context = createMockPanelContext();

root.render(
  <React.StrictMode>
    <JoyPanel context={context} />
  </React.StrictMode>,
);
