import { PanelExtensionContext } from "@foxglove/extension";

import { PanelConfig } from "./types";
import { kbmapping1 } from "@/mappings";
import { KbMap } from "@/types";

export const createDefaultConfig = (context?: PanelExtensionContext): PanelConfig => {
  const partialConfig = (context?.initialState ?? {}) as Partial<PanelConfig>;
  const normalizedDataSource =
    partialConfig.dataSource === "interactive" ? "joystick" : partialConfig.dataSource;

  return {
    pubJoyTopic: partialConfig.pubJoyTopic ?? "/joy",
    publishJoy: partialConfig.publishJoy ?? false,
    publishTwistMode: partialConfig.publishTwistMode ?? false,
    pubTwistTopic: partialConfig.pubTwistTopic ?? "/cmd_vel",
    dataSource: normalizedDataSource ?? "gamepad",
    gamepadJoyTransform: partialConfig.gamepadJoyTransform ?? "default",
    gamepadId: partialConfig.gamepadId ?? 0,
    twistMapping: partialConfig.twistMapping ?? {
      linearX: { sourceType: "axis", sourceIndex: 1, scale: 1, invert: true },
      linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
      angularZ: { sourceType: "axis", sourceIndex: 0, scale: 1, invert: false },
    },
    showButtons: partialConfig.showButtons ?? true,
    showAxes: partialConfig.showAxes ?? true,
    axisVisualization: partialConfig.axisVisualization ?? "bars",
    showGamepad: partialConfig.showGamepad ?? true,
    showGamepadRightSide: partialConfig.showGamepadRightSide ?? true,
    showKeyboard: partialConfig.showKeyboard ?? true,
    showKeyboardRightSide: partialConfig.showKeyboardRightSide ?? true,
    showJoystick: partialConfig.showJoystick ?? true,
    showJoystickRightSide: partialConfig.showJoystickRightSide ?? true,
    showControlButtons: partialConfig.showControlButtons ?? true,
    keyboardLayout: partialConfig.keyboardLayout ?? "wasd",
    joystickAxis: partialConfig.joystickAxis ?? "both",
    joystickSize: partialConfig.joystickSize ?? "md",
    joystickSticky: partialConfig.joystickSticky ?? false,
    options: {
      availableControllers: [],
    },
  };
};

export const createKeyboardMapping = (): Map<string, KbMap> => {
  const keyMap = new Map<string, KbMap>();

  for (const [key, value] of Object.entries(kbmapping1)) {
    const k: KbMap = {
      button: value.button,
      axis: value.axis,
      direction: value.direction === "+" ? 1 : 0,
      value: 0,
    };
    keyMap.set(key, k);
  }
  return keyMap;
};
