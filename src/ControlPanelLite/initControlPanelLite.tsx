import { PanelExtensionContext } from "@foxglove/extension";
import { createRoot } from "react-dom/client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { ControlPanelLite } from "./ControlPanelLite";

export function initControlPanelLite(context: PanelExtensionContext): () => void {
  const root = createRoot(context.panelElement);
  root.render(
    <TooltipProvider delay={1000}>
      <div className="h-full w-full bg-background">
        <ControlPanelLite context={context} />
      </div>
    </TooltipProvider>,
  );

  return () => {
    root.unmount();
  };
}
