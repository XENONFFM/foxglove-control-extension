import * as React from "react";
import { CircleDot, Gamepad2, Keyboard } from "lucide-react";

import { PanelConfig } from "@/config";
import { LightGamepadCard, LightJoystickCard, LightKeyboardCard } from "@/components/light";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Joy } from "@/types";

type PanelKey = "gamepad" | "joystick" | "keyboard";

type PanelButton = {
  key: PanelKey;
  icon: React.ReactNode;
  label: string;
};

const PANEL_BUTTONS: PanelButton[] = [
  { key: "gamepad", icon: <Gamepad2 className="size-3.5" />, label: "Gamepad" },
  { key: "joystick", icon: <CircleDot className="size-3.5" />, label: "Joystick" },
  { key: "keyboard", icon: <Keyboard className="size-3.5" />, label: "Keyboard" },
];

export function ControlPanelLiteView({
  config,
  onConfigChange,
  onInteractiveJoy,
}: {
  config: PanelConfig;
  onConfigChange: (patch: Partial<PanelConfig>) => void;
  onInteractiveJoy: (joy: Joy) => void;
}): React.ReactElement {
  const visiblePanels = React.useMemo(() => {
    const panels: PanelKey[] = [];
    if (config.showGamepad) {
      panels.push("gamepad");
    }
    if (config.showJoystick) {
      panels.push("joystick");
    }
    if (config.showKeyboard) {
      panels.push("keyboard");
    }
    return panels;
  }, [config.showGamepad, config.showJoystick, config.showKeyboard]);

  const [selectedPanel, setSelectedPanel] = React.useState<PanelKey>("gamepad");

  React.useEffect(() => {
    if (visiblePanels.length === 0) {
      return;
    }

    const currentDataSource = config.dataSource as PanelKey;
    if (visiblePanels.includes(currentDataSource)) {
      setSelectedPanel(currentDataSource);
      return;
    }

    const fallbackPanel = visiblePanels[0];
    if (fallbackPanel && config.dataSource !== fallbackPanel) {
      onConfigChange({ dataSource: fallbackPanel });
    }
    setSelectedPanel(fallbackPanel ?? "gamepad");
  }, [config.dataSource, onConfigChange, visiblePanels]);

  const activePanel = visiblePanels.includes(selectedPanel) ? selectedPanel : visiblePanels[0];
  const preferredVisualType = config.gamepadJoyTransform === "ps5" ? "dualsense" : "xbox";

  const selectPanel = (panel: PanelKey): void => {
    setSelectedPanel(panel);
    if (config.dataSource !== panel) {
      onConfigChange({ dataSource: panel });
    }
  };

  return (
    <div className="h-full w-full overflow-hidden">
      <div className="flex h-full w-full flex-col gap-1 p-1">
        {config.showLiteTabBar && (
          <div className="shrink-0">
            <Tabs
              value={activePanel}
              onValueChange={(next) => {
                if (next === "gamepad" || next === "joystick" || next === "keyboard") {
                  selectPanel(next);
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-3">
              {PANEL_BUTTONS.map((panelButton) => {
                const isVisible = visiblePanels.includes(panelButton.key);

                return (
                  <TabsTrigger
                    key={panelButton.key}
                    value={panelButton.key}
                    disabled={!isVisible}
                    aria-label={panelButton.label}
                    title={panelButton.label}
                    className={cn("h-6 w-full", !isVisible && "opacity-35")}
                  >
                    <span className="inline-flex w-full items-center justify-center truncate">
                      {panelButton.icon}
                    </span>
                  </TabsTrigger>
                );
              })}
              </TabsList>
            </Tabs>
          </div>
        )}

        <div className="flex min-h-0 flex-1">
          {!activePanel && (
            <div className="flex h-full items-center justify-center rounded-xl border border-border/60 bg-background/90 px-2 text-center text-xs text-muted-foreground">
              Enable at least one panel in settings.
            </div>
          )}

          {activePanel === "gamepad" && (
            <LightGamepadCard
              enabled={config.dataSource === "gamepad"}
              selectedControllerIndex={config.gamepadId}
              gamepadVisualization={config.gamepadVisualization}
              preferredVisualType={preferredVisualType}
              gamepadDeadzoneEnabled={config.gamepadDeadzoneEnabled}
              gamepadDeadzone={config.gamepadDeadzone}
            />
          )}

          {activePanel === "joystick" && (
            <LightJoystickCard
              size={config.joystickSize}
              axisLeft={config.joystickAxisLeft}
              axisRight={config.joystickAxisRight}
              sticky={config.joystickSticky}
              secondJoystick={config.joystickSecond}
              enabled={config.dataSource === "joystick"}
              onInteractiveJoy={onInteractiveJoy}
            />
          )}

          {activePanel === "keyboard" && (
            <LightKeyboardCard
              layout={config.keyboardLayout}
              enabled={config.dataSource === "keyboard"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
