import { InputMapping, TwistMapping } from "../config/types";
import { Twist, Vector3 } from "../types";
import { Joy } from "../types";

/**
 * Get the value of an input source (axis or button) from a gamepad or joy message
 */
function getInputValue(
  mapping: InputMapping,
  source: Gamepad | Joy,
): number {
  if (mapping.sourceType === "none") {
    return 0;
  }

  let value = 0;

  if (source instanceof Gamepad) {
    if (mapping.sourceType === "axis" && mapping.sourceIndex < source.axes.length) {
      value = source.axes[mapping.sourceIndex] ?? 0;
    } else if (mapping.sourceType === "button" && mapping.sourceIndex < source.buttons.length) {
      const button = source.buttons[mapping.sourceIndex];
      if (button != null) {
        value = button.pressed ? 1 : 0;
      }
    }
  } else {
    // Joy message
    if (mapping.sourceType === "axis" && mapping.sourceIndex < source.axes.length) {
      value = source.axes[mapping.sourceIndex] ?? 0;
    } else if (mapping.sourceType === "button" && mapping.sourceIndex < source.buttons.length) {
      value = (source.buttons[mapping.sourceIndex] ?? 0) > 0.5 ? 1 : 0;
    }
  }

  // Apply scale and invert
  value *= mapping.scale;
  if (mapping.invert) {
    value = -value;
  }

  return value;
}

/**
 * Convert gamepad or joy input to a Twist message based on the mapping configuration
 */
export function joyToTwist(
  source: Gamepad | Joy,
  twistMapping: TwistMapping,
): Twist {
  const linearX = getInputValue(twistMapping.linearX, source);
  const linearY = getInputValue(twistMapping.linearY, source);
  const linearZ = getInputValue(twistMapping.linearZ, source);
  const angularX = getInputValue(twistMapping.angularX, source);
  const angularY = getInputValue(twistMapping.angularY, source);
  const angularZ = getInputValue(twistMapping.angularZ, source);

  return {
    linear: {
      x: linearX,
      y: linearY,
      z: linearZ,
    },
    angular: {
      x: angularX,
      y: angularY,
      z: angularZ,
    },
  };
}

/**
 * Validate twist mapping configuration
 */
export function isValidTwistMapping(twistMapping: TwistMapping): boolean {
  const mappings = [
    twistMapping.linearX,
    twistMapping.linearY,
    twistMapping.linearZ,
    twistMapping.angularX,
    twistMapping.angularY,
    twistMapping.angularZ,
  ];

  return mappings.every(
    (mapping) =>
      mapping.sourceType &&
      (typeof mapping.sourceIndex === "number") &&
      (typeof mapping.scale === "number") &&
      (typeof mapping.invert === "boolean"),
  );
}

/**
 * Create an empty/zero Twist message
 */
export function createEmptyTwist(): Twist {
  return {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  };
}
