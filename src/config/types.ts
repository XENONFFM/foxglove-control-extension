import { GamepadJoyTransformKey } from "../mappings/gamepadJoyTransforms";
import { GamepadLayoutMappingKey } from "../mappings/gamepadLayoutMappings";

export type InputSourceType = "none" | "axis" | "button";

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
  dataSource: string;
  subJoyTopic: string;
  gamepadId: number;
  publishMode: boolean;
  pubJoyTopic: string;
  publishTwistMode: boolean;
  pubTwistTopic: string;
  publishFrameId: string;
  displayMode: string;
  debugGamepad: boolean;
  layoutName: GamepadLayoutMappingKey;
  gamepadJoyTransform: GamepadJoyTransformKey;
  twistMapping: TwistMapping;
  options: PanelOptions;
};

export type PanelOptions = {
  availableControllers: Gamepad[];
};
