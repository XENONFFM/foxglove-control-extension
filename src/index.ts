import { ExtensionContext } from "@foxglove/extension";

import { initControlPanel } from "./components/ControlPanel/ControlPanel";
import "./styles/globals.css";
import "./styles/output.css";

export function activate(extensionContext: ExtensionContext): void {
  extensionContext.registerPanel({ name: "ASLZ Control", initPanel: initControlPanel });
}
