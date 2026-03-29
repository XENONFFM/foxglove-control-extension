import { GamepadJoyTransformKey } from "@/mappings/gamepadJoyTransforms";

export type InputSourceType = "none" | "axis" | "button";
export type AxisVisualizationMode = "plots" | "bars";
export type JoystickAxisMode = "x" | "y" | "both";
export type JoystickSize = "auto" | "xs" | "sm" | "md" | "lg" | "xl";
export type GamepadVisualizationMode = "auto" | "generic" | "xbox" | "dualsense";

export type InputMapping = {
  sourceType: InputSourceType; // "none", "axis", "button"
  sourceIndex: number; // axis or button index
  scale: number; // multiplier for the value
  invert: boolean; // invert the value
};

export type TwistMapping = {
  linearX: InputMapping;
  linearY: InputMapping;
  linearZ: InputMapping;
  angularX: InputMapping;
  angularY: InputMapping;
  angularZ: InputMapping;
};

export type PanelConfig = {
  showLiteTabBar: boolean;
  showKeyboard: boolean;
  showKeyboardRightSide: boolean;
  showJoystick: boolean;
  showJoystickRightSide: boolean;
  showControlButtons: boolean;
  dataSource: string;
  gamepadId: number;
  publishJoy: boolean;
  pubJoyTopic: string;
  publishTwistMode: boolean;
  pubTwistTopic: string;
  showButtons: boolean;
  showAxes: boolean;
  axisVisualization: AxisVisualizationMode;
  showGamepad: boolean;
  showGamepadRightSide: boolean;
  gamepadVisualization: GamepadVisualizationMode;
  gamepadDeadzoneEnabled: boolean;
  gamepadDeadzone: number;
  keyboardLayout: "wasd" | "arrows";
  joystickAxisLeft: JoystickAxisMode;
  joystickAxisRight: JoystickAxisMode;
  joystickSize: JoystickSize;
  joystickSticky: boolean;
  joystickSecond: boolean;
  gamepadJoyTransform: GamepadJoyTransformKey;
  twistMappingGamepad: TwistMapping;
  twistMappingKeyboard: TwistMapping;
  twistMappingJoystick: TwistMapping;
};

/** Runtime-only state: not serialised into panel config / saveState. */
export type PanelRuntimeState = {
  availableControllers: Gamepad[];
};
