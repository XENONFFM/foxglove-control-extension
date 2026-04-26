import { fromDate } from "@foxglove/rostime";
import React, { useCallback } from "react";

import { PanelConfig } from "@/config";
import { transformGamepadToJoy } from "@/mappings/gamepadJoyTransforms";
import { Joy } from "@/types";

/**
 * Gamepad lifecycle callbacks and the interactive/joystick Joy callback.
 * Handles connect/disconnect (updates available-controllers list) and per-frame
 * gamepad state → Joy conversion. The interactive callback accepts Joy directly
 * (used by the on-screen joystick) and is gated to the joystick data source.
 */
export function useGamepadCallbacks(
  config: PanelConfig,
  setJoy: React.Dispatch<React.SetStateAction<Joy | undefined>>,
  setAvailableControllers: React.Dispatch<React.SetStateAction<Gamepad[]>>,
): {
  interactiveCb: (interactiveJoy: Joy) => void;
  handleGamepadConnect: (gp: Gamepad) => void;
  handleGamepadDisconnect: (gp: Gamepad) => void;
  handleGamepadUpdate: (gp: Gamepad) => void;
} {
  const interactiveCb = useCallback(
    (interactiveJoy: Joy) => {
      if (config.dataSource !== "joystick" && config.dataSource !== "interactive") {
        return;
      }
      setJoy({
        header: {
          frame_id: "",
          stamp: fromDate(new Date()),
        },
        axes: interactiveJoy.axes,
        buttons: interactiveJoy.buttons,
      });
    },
    [config.dataSource, setJoy],
  );

  const handleGamepadConnect = useCallback(
    (gp: Gamepad) => {
      setAvailableControllers((prev) => {
        if (prev.some((controller) => controller.index === gp.index)) {
          return prev;
        }
        return [...prev, gp];
      });
    },
    [setAvailableControllers],
  );

  const handleGamepadDisconnect = useCallback(
    (gp: Gamepad) => {
      setAvailableControllers((prev) => prev.filter((controller) => controller.index !== gp.index));
    },
    [setAvailableControllers],
  );

  const handleGamepadUpdate = useCallback(
    (gp: Gamepad) => {
      if (config.dataSource !== "gamepad" || config.gamepadId !== gp.index) {
        return;
      }
      setJoy(transformGamepadToJoy(config.gamepadJoyTransform, gp));
    },
    [config.dataSource, config.gamepadId, config.gamepadJoyTransform, setJoy],
  );

  return { interactiveCb, handleGamepadConnect, handleGamepadDisconnect, handleGamepadUpdate };
}
