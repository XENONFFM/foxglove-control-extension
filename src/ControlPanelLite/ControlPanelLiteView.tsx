import { CircleDot, Gamepad2, Keyboard } from "lucide-react";
import * as React from "react";

import { LightGamepadCard, LightJoystickCard, LightKeyboardCard } from "@/components/light";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PanelConfig } from "@/config";
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

  const selectedPanel = config.dataSource as PanelKey;

  React.useEffect(() => {
    if (visiblePanels.length === 0) {
      return;
    }

    const currentDataSource = config.dataSource as PanelKey;
    if (visiblePanels.includes(currentDataSource)) {
      return;
    }

    const fallbackPanel = visiblePanels[0];
    if (fallbackPanel && config.dataSource !== fallbackPanel) {
      onConfigChange({ dataSource: fallbackPanel });
    }
  }, [config.dataSource, onConfigChange, visiblePanels]);

  const preferredVisualType = config.gamepadJoyTransform === "ps5" ? "dualsense" : "xbox";

  return (
    <div className="h-full w-full overflow-hidden p-1 bg-secondary">
      <Card className="flex h-full w-full flex-col gap-1 p-1">
        <Tabs
          value={selectedPanel}
          onValueChange={(value) => {
            const nextPanel = value as PanelKey;
            if (nextPanel !== config.dataSource) {
              onConfigChange({ dataSource: nextPanel });
            }
          }}
          className="h-full w-full"
        >
          {config.showLiteTabBar && (
            <TabsList className="w-full h-6 shrink-0">
              {PANEL_BUTTONS.map((panelButton) => {
                return (
                  <TabsTrigger
                    key={panelButton.key}
                    value={panelButton.key}
                    aria-label={panelButton.label}
                    title={panelButton.label}
                  >
                    <span className="inline-flex w-full items-center justify-center truncate">
                      {panelButton.icon}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          )}
          <TabsContent value="gamepad">
            <LightGamepadCard
              enabled={config.dataSource === "gamepad"}
              selectedControllerIndex={config.gamepadId}
              gamepadVisualization={config.gamepadVisualization}
              preferredVisualType={preferredVisualType}
              gamepadDeadzoneEnabled={config.gamepadDeadzoneEnabled}
              gamepadDeadzone={config.gamepadDeadzone}
            />
          </TabsContent>
          <TabsContent value="joystick">
            <LightJoystickCard
              size={config.joystickSize}
              axisLeft={config.joystickAxisLeft}
              axisRight={config.joystickAxisRight}
              sticky={config.joystickSticky}
              secondJoystick={config.joystickSecond}
              enabled={config.dataSource === "joystick"}
              onInteractiveJoy={onInteractiveJoy}
            />
          </TabsContent>
          <TabsContent value="keyboard">
            <LightKeyboardCard
              layout={config.keyboardLayout}
              enabled={config.dataSource === "keyboard"}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
