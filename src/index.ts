import { ExtensionContext } from "@foxglove/extension";

import { initControlPanel } from "@/ControlPanel";
import { initControlPanelLite } from "@/ControlPanelLite";
// import "@/styles/globals.css";
import "@/styles/output.css";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "ASLZ Control", initPanel: initControlPanel });
  extensionContext.registerPanel({ name: "ASLZ Control Lite", initPanel: initControlPanelLite });
}
