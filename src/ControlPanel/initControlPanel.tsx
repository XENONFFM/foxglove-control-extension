import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";

import { ControlPanel } from "./ControlPanel";

import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Foxglove panel factory — lives here (not in ControlPanel.tsx) so that
 * ControlPanel.tsx only has component exports, keeping Vite Fast Refresh happy.
 */
export function initControlPanel(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(
    <TooltipProvider delay={1000}>
      <div className="h-full w-full">
        <ControlPanel context={context} />
      </div>
    </TooltipProvider>,
  );
  return () => {
    root.unmount();
  };
}
