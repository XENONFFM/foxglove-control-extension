import { ExtensionContext } from "@foxglove/extension";

import { initControlPanel } from "@/ControlPanel";
import "@/styles/globals.css";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "ASLZ Control", initPanel: initControlPanel });
}
