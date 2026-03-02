import { type ReactElement } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ControlPanel } from "@/ControlPanel";
import { PanelExtensionContext } from "@foxglove/extension";
import { SettingsSheet } from "./components/settings-sheet";

export function HarnessApp({ context }: { context: PanelExtensionContext }): ReactElement {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nina-harness-theme">
      <div className="relative mx-auto flex h-full w-full bg-background">
        <ControlPanel context={context} />
        <SettingsSheet context={context} />
      </div>
    </ThemeProvider>
  );
}
