import React from "react";

import { PanelConfig } from "../../config";
import { Joy } from "../../types";
import { GamepadTester } from "../GamepadTester/GamepadTester";
import { SimpleButtonView } from "../SimpleButtonView";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function JoyPanelView({
  config,
  joy,
  kbEnabled,
  handleKbSwitch,
}: {
  readonly config: PanelConfig;
  readonly joy: unknown;
  readonly kbEnabled: boolean;
  readonly handleKbSwitch: (payload: { enabled: boolean }) => void;
}): JSX.Element {
  // if (joy == undefined && config.displayMode === "custom") {
  //   return <div>No Joystick detected</div>;
  // }

  return (
    <div>
      {config.dataSource === "keyboard" ? (
        <div className="flex items-center gap-2">
          <Switch
            id="kb-enabled"
            checked={kbEnabled}
            onCheckedChange={(checked) => {
              handleKbSwitch({ enabled: checked });
            }}
          />
          <Label htmlFor="kb-enabled">Enable Keyboard</Label>
        </div>
      ) : null}
      {config.displayMode === "auto" ? <SimpleButtonView joy={joy as Joy | undefined} /> : null}
      {config.displayMode === "custom" ? <GamepadTester /> : null}
    </div>
  );
}
