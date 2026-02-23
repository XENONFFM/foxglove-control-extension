import { GamepadJoyTransformKey } from "@/mappings/gamepadJoyTransforms";

export type InputSourceType = "none" | "axis" | "button";
export type AxisVisualizationMode = "plots" | "bars";
export type JoystickAxisMode = "x" | "y" | "both";
export type JoystickSize = "xs" | "sm" | "md" | "lg" | "xl";

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
  keyboardLayout: "wasd" | "arrows";
  joystickAxis: JoystickAxisMode;
  joystickSize: JoystickSize;
  joystickSticky: boolean;
  gamepadJoyTransform: GamepadJoyTransformKey;
  twistMapping: TwistMapping;
  options: PanelOptions;
};

export type PanelOptions = {
  availableControllers: Gamepad[];
};
