import { fromDate } from "@foxglove/rostime";

import { Header, Joy } from "../types";

type GameToJoyTransformFunction = (gp: Gamepad) => Joy;

export type GamepadJoyTransformKey = "default" | "xbox" | "xbox_reverse" | "ps5";

function mapTrigger(
  value: number,
  input_min: number,
  input_max: number,
  output_min: number,
  output_max: number,
): number {
  // Ensure the input value is within the input range
  const clampedValue = Math.max(input_min, Math.min(input_max, value));

  // Calculate the input range and output range
  const inputRange = input_max - input_min;
  const outputRange = output_max - output_min;

  // Map the value from input range to output range
  const mappedVal = ((clampedValue - input_min) / inputRange) * outputRange + output_min;
  return mappedVal;
}

function reverseAllAxis(joy: Joy): Joy {
  joy.axes = joy.axes.map((axis) => -axis);
  return joy;
}

const defaultGameToJoyTransform = (gp: Gamepad): Joy => {
  return {
    header: {
      frame_id: "",
      stamp: fromDate(new Date()),
    } as Header,
    axes: gp.axes.map((axis) => -axis),
    buttons: gp.buttons.map((button) => (button.pressed ? 1 : 0)),
  } as Joy;
};

function xboxPadToJoyTransform(gp: Gamepad): Joy {
  const leftTriggerButtonIndex = 6;
  const rightTriggerButtonIndex = 7;

  const tmpJoy = {
    header: {
      frame_id: "",
      stamp: fromDate(new Date()),
    } as Header,
    axes: gp.axes.map((axis) => -axis),
    buttons: gp.buttons.map((button) => button.value),
  } as Joy;

  // We have to do this hacky thing because the triggers are buttons on the xbox controller
  const leftTriggerButton = gp.buttons[leftTriggerButtonIndex];
  if (leftTriggerButton != undefined) {
    tmpJoy.axes.push(mapTrigger(leftTriggerButton.value, 0, 1, -1, 1));
  }
  const rightTriggerButton = gp.buttons[rightTriggerButtonIndex];
  if (rightTriggerButton != undefined) {
    tmpJoy.axes.push(mapTrigger(rightTriggerButton.value, 0, 1, -1, 1));
  }

  const xboxButtons = gp.buttons.map((button, index) => {
    if (index === leftTriggerButtonIndex || index === rightTriggerButtonIndex) {
      return mapTrigger(button.value, 0, 1, -1, 1);
    } else {
      return button.pressed ? 1 : 0;
    }
  });
  tmpJoy.buttons = xboxButtons;
  return reverseAllAxis(tmpJoy);
}

function ps5PadToJoyTransform(gp: Gamepad): Joy {
  const leftTriggerButtonIndex = 6;
  const rightTriggerButtonIndex = 7;

  const tmpJoy = {
    header: {
      frame_id: "",
      stamp: fromDate(new Date()),
    } as Header,
    axes: gp.axes.map((axis) => -axis),
    buttons: gp.buttons.map((button) => button.value),
  } as Joy;

  // PS5 triggers (B6/B7) are analog buttons with values in range [0, 1]
  const leftTriggerButton = gp.buttons[leftTriggerButtonIndex];
  if (leftTriggerButton != undefined) {
    tmpJoy.axes.push(mapTrigger(leftTriggerButton.value, 0, 1, 0, 1));
  }
  const rightTriggerButton = gp.buttons[rightTriggerButtonIndex];
  if (rightTriggerButton != undefined) {
    tmpJoy.axes.push(mapTrigger(rightTriggerButton.value, 0, 1, 0, 1));
  }

  const ps5Buttons = gp.buttons.map((button, index) => {
    if (index === leftTriggerButtonIndex || index === rightTriggerButtonIndex) {
      return button.pressed ? 1 : 0;
    }
    return button.pressed ? 1 : 0;
  });

  tmpJoy.buttons = ps5Buttons;
  return tmpJoy;
}

interface GamepadMappingEntry {
  label: string;
  transformFunction: GameToJoyTransformFunction;
}

type GamepadJoyTransforms = {
  [key: string]: GamepadMappingEntry;
};

const gamepadJoyMappings: GamepadJoyTransforms = {
  default: {
    label: "Default",
    transformFunction: defaultGameToJoyTransform,
  },
  xbox: {
    label: "Xbox",
    transformFunction: xboxPadToJoyTransform,
  },
  ps5: {
    label: "PlayStation 5",
    transformFunction: ps5PadToJoyTransform,
  },
};

export function transformGamepadToJoy(transformName: GamepadJoyTransformKey, gp: Gamepad): Joy {
  return gamepadJoyMappings[transformName]!.transformFunction(gp);
}

export function getGamepadJoyTransformOptions(): GamepadJoyTransforms {
  return gamepadJoyMappings;
}
