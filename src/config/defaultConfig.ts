import { PanelConfig } from "./types";

function createDefaultGamepadTwistMapping(): PanelConfig["twistMappingGamepad"] {
  return {
    linearX: { sourceType: "axis", sourceIndex: 1, scale: 1, invert: true },
    linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularZ: { sourceType: "axis", sourceIndex: 0, scale: 1, invert: false },
  };
}

function createDefaultKeyboardTwistMapping(): PanelConfig["twistMappingKeyboard"] {
  return {
    linearX: { sourceType: "axis", sourceIndex: 1, scale: 1, invert: false },
    linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularZ: { sourceType: "axis", sourceIndex: 0, scale: 1, invert: false },
  };
}

function createDefaultJoystickTwistMapping(): PanelConfig["twistMappingJoystick"] {
  return {
    linearX: { sourceType: "axis", sourceIndex: 1, scale: 1, invert: false },
    linearY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    linearZ: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularX: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularY: { sourceType: "none", sourceIndex: 0, scale: 1, invert: false },
    angularZ: { sourceType: "axis", sourceIndex: 0, scale: 1, invert: false },
  };
}

export const createDefaultConfig = (saved?: Partial<PanelConfig>): PanelConfig => {
  const partialConfig = saved ?? {};
  const normalizedDataSource =
    partialConfig.dataSource === "interactive" ? "joystick" : partialConfig.dataSource;

  return {
    showLiteTabBar: partialConfig.showLiteTabBar ?? true,
    pubJoyTopic: partialConfig.pubJoyTopic ?? "/joy",
    publishJoy: partialConfig.publishJoy ?? false,
    publishTwistMode: partialConfig.publishTwistMode ?? false,
    pubTwistTopic: partialConfig.pubTwistTopic ?? "/cmd_vel",
    dataSource: normalizedDataSource ?? "gamepad",
    gamepadJoyTransform: partialConfig.gamepadJoyTransform ?? "default",
    gamepadId: partialConfig.gamepadId ?? 0,
    twistMappingGamepad: partialConfig.twistMappingGamepad ?? createDefaultGamepadTwistMapping(),
    twistMappingKeyboard: partialConfig.twistMappingKeyboard ?? createDefaultKeyboardTwistMapping(),
    twistMappingJoystick: partialConfig.twistMappingJoystick ?? createDefaultJoystickTwistMapping(),
    showButtons: partialConfig.showButtons ?? true,
    showAxes: partialConfig.showAxes ?? true,
    axisVisualization: partialConfig.axisVisualization ?? "bars",
    showGamepad: partialConfig.showGamepad ?? true,
    showGamepadRightSide: partialConfig.showGamepadRightSide ?? true,
    gamepadVisualization: partialConfig.gamepadVisualization ?? "auto",
    gamepadDeadzoneEnabled: partialConfig.gamepadDeadzoneEnabled ?? true,
    gamepadDeadzone: partialConfig.gamepadDeadzone ?? 0.08,
    showKeyboard: partialConfig.showKeyboard ?? true,
    showKeyboardRightSide: partialConfig.showKeyboardRightSide ?? true,
    showJoystick: partialConfig.showJoystick ?? true,
    showJoystickRightSide: partialConfig.showJoystickRightSide ?? true,
    showControlButtons: partialConfig.showControlButtons ?? true,
    keyboardLayout: partialConfig.keyboardLayout ?? "wasd",
    joystickAxisLeft: partialConfig.joystickAxisLeft ?? "both",
    joystickAxisRight: partialConfig.joystickAxisRight ?? "both",
    joystickSize: partialConfig.joystickSize ?? "md",
    joystickSticky: partialConfig.joystickSticky ?? false,
    joystickSecond: partialConfig.joystickSecond ?? false,
  };
};
