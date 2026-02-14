import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";

import { GamepadTester } from "./GamepadTester";

export function initGamepadTesterPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(<GamepadTester />);

  // Return a function to run when the panel is removed
  return () => {
    root.unmount();
  };
}
