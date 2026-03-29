import { PanelConfig } from "./types";

type LegacyGamepadVisualizationMode = "ps4" | "ps5" | "dualshock" | "steamdeck";

function normalizeGamepadVisualizationMode(
  mode: PanelConfig["gamepadVisualization"] | LegacyGamepadVisualizationMode | undefined,
): PanelConfig["gamepadVisualization"] {
  if (mode === "ps4") {
    return "dualsense";
  }

  if (mode === "ps5") {
    return "dualsense";
  }

  if (mode === "dualshock") {
    return "dualsense";
  }

  if (mode === "steamdeck") {
    return "generic";
  }

  return mode ?? "auto";
}

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
  const legacySavedTwistMapping = (saved as { twistMapping?: PanelConfig["twistMappingGamepad"] })
    ?.twistMapping;
  const legacySavedManualMapping = (
    saved as { twistMappingManual?: PanelConfig["twistMappingGamepad"] }
  )?.twistMappingManual;
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
    twistMappingGamepad:
      partialConfig.twistMappingGamepad ??
      legacySavedTwistMapping ??
      createDefaultGamepadTwistMapping(),
    twistMappingKeyboard:
      partialConfig.twistMappingKeyboard ??
      legacySavedManualMapping ??
      legacySavedTwistMapping ??
      createDefaultKeyboardTwistMapping(),
    twistMappingJoystick:
      partialConfig.twistMappingJoystick ??
      legacySavedManualMapping ??
      legacySavedTwistMapping ??
      createDefaultJoystickTwistMapping(),
    showButtons: partialConfig.showButtons ?? true,
    showAxes: partialConfig.showAxes ?? true,
    axisVisualization: partialConfig.axisVisualization ?? "bars",
    showGamepad: partialConfig.showGamepad ?? true,
    showGamepadRightSide: partialConfig.showGamepadRightSide ?? true,
    gamepadVisualization: normalizeGamepadVisualizationMode(
      (
        saved as {
          gamepadVisualization?:
            | PanelConfig["gamepadVisualization"]
            | LegacyGamepadVisualizationMode;
        }
      )?.gamepadVisualization,
    ),
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
