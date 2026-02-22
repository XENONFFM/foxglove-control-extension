import React from "react";
import { createRoot } from "react-dom/client";

import { createMockPanelContext } from "./mockPanelContext";
import { ControlPanel } from "@/ControlPanel";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import "@/styles/output.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
const context = createMockPanelContext();

root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <div className="h-full w-full bg-background relative">
        <ControlPanel context={context} />
      </div>
    </ThemeProvider>
  </React.StrictMode>,
);
