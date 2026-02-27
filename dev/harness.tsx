import { type ReactElement } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ControlPanel } from "@/ControlPanel";
import { PanelExtensionContext } from "@foxglove/extension";
import { SettingsMenu } from "./settings-menu";

export function Harness({ context }: { context: PanelExtensionContext }): ReactElement {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nina-harness-theme">
      <div className="relative mx-auto flex h-full w-full bg-background">
        <ControlPanel context={context} />
        <SettingsMenu context={context} />
      </div>
    </ThemeProvider>
  );
}
