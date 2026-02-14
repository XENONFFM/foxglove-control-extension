import { FormGroup, FormControlLabel, Switch } from "@mui/material";
import React from "react";

import { PanelConfig } from "../../config";
import { Joy } from "../../types";
import { GamepadTester } from "../GamepadTester/GamepadTester";
import { SimpleButtonView } from "../SimpleButtonView";

export function JoyPanelView({
  config,
  joy,
  kbEnabled,
  handleKbSwitch,
}: {
  readonly config: PanelConfig;
  readonly joy: unknown;
  readonly kbEnabled: boolean;
  readonly handleKbSwitch: (event: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
  if (joy == undefined && config.displayMode === "custom") {
    return <div>No Joystick detected</div>;
  }

  return (
    <div>
      {config.dataSource === "keyboard" ? (
        <FormGroup>
          <FormControlLabel
            control={<Switch checked={kbEnabled} onChange={handleKbSwitch} />}
            label="Enable Keyboard"
          />
        </FormGroup>
      ) : null}
      {config.displayMode === "auto" ? <SimpleButtonView joy={joy as Joy | undefined} /> : null}
      {config.displayMode === "custom" ? <GamepadTester /> : null}
    </div>
  );
}
