import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";

import { ControlPanel } from "./ControlPanel";

/**
 * Foxglove panel factory — lives here (not in ControlPanel.tsx) so that
 * ControlPanel.tsx only has component exports, keeping Vite Fast Refresh happy.
 */
export function initControlPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(
    <div className="h-full w-full bg-background">
      <ControlPanel context={context} />
    </div>,
  );
  return () => {
    root.unmount();
  };
}
