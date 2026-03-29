import { SettingsTreeFields, SettingsTreeNodes } from "@foxglove/extension";

import { PanelConfig, TwistMapping } from "./types";
import { createDefaultConfig } from "./defaultConfig";
import { collectNodeKeys, makeSettingsReducer } from "@/lib/makeSettingsReducer";
import { getGamepadJoyTransformOptions } from "@/mappings/gamepadJoyTransforms";

const sourceTypeOptions = [
  { label: "None", value: "none" },
  { label: "Axis", value: "axis" },
  { label: "Button", value: "button" },
];

const twistFieldDefinitions = [
  { key: "linearX", label: "Linear X" },
  { key: "linearY", label: "Linear Y" },
  { key: "linearZ", label: "Linear Z" },
  { key: "angularX", label: "Angular X" },
  { key: "angularY", label: "Angular Y" },
  { key: "angularZ", label: "Angular Z" },
];

function buildTwistMappingFields(
  mappingConfig: TwistMapping,
  mappingPathPrefix: "twistMappingGamepad" | "twistMappingKeyboard" | "twistMappingJoystick",
  currentGamepad?: Gamepad,
): SettingsTreeFields {
  const fields: SettingsTreeFields = {};

  twistFieldDefinitions.forEach(({ key }) => {
    const mapping = mappingConfig[key as keyof TwistMapping];
    const basePath = `${mappingPathPrefix}.${key}`;
    const sourceIndexLabel = mapping.sourceType === "button" ? "Button" : "Axis";

    fields[`${basePath}.sourceType`] = {
      label: "Source",
      input: "select",
      value: mapping.sourceType,
      options: sourceTypeOptions,
      help: "Select whether this axis comes from a joystick axis, a button, or is disabled.",
    };

    if (mapping.sourceType === "none") {
      fields[`${basePath}.sourceIndex`] = {
        label: sourceIndexLabel,
        input: "number",
        value: mapping.sourceIndex,
        disabled: true,
        help: "Disabled because Source is set to None.",
      };
    } else if (currentGamepad && mapping.sourceType === "axis") {
      fields[`${basePath}.sourceIndex`] = {
        label: "Axis",
        input: "select",
        value: mapping.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_value, index) => ({
          label: `Axis ${index}`,
          value: index.toString(),
        })),
        help: "Choose which gamepad axis controls this output.",
      };
    } else if (currentGamepad && mapping.sourceType === "button") {
      fields[`${basePath}.sourceIndex`] = {
        label: "Button",
        input: "select",
        value: mapping.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_value, index) => ({
          label: `Button ${index}`,
          value: index.toString(),
        })),
        help: "Choose which gamepad button controls this output.",
      };
    } else {
      fields[`${basePath}.sourceIndex`] = {
        label: sourceIndexLabel,
        input: "number",
        value: mapping.sourceIndex,
        help: `Set the ${sourceIndexLabel.toLowerCase()} index used for this output.`,
      };
    }

    fields[`${basePath}.scale`] = {
      label: "Scale",
      input: "number",
      value: mapping.scale,
      help: "Multiply this input by this factor before publishing Twist.",
    };

    fields[`${basePath}.invert`] = {
      label: "Invert",
      input: "boolean",
      value: mapping.invert,
      help: "Invert the sign of this input before publishing Twist.",
    };
  });

  return fields;
}

function buildTwistAxisChildren(
  mappingPathPrefix: "twistMappingGamepad" | "twistMappingKeyboard" | "twistMappingJoystick",
  fields: SettingsTreeFields,
): SettingsTreeNodes {
  const axisChildren: SettingsTreeNodes = {};

  twistFieldDefinitions.forEach(({ key, label }) => {
    const basePath = `${mappingPathPrefix}.${key}`;
    axisChildren[key] = {
      label,
      fields: {
        [`${basePath}.sourceType`]: fields[`${basePath}.sourceType`],
        [`${basePath}.sourceIndex`]: fields[`${basePath}.sourceIndex`],
        [`${basePath}.scale`]: fields[`${basePath}.scale`],
        [`${basePath}.invert`]: fields[`${basePath}.invert`],
      },
    };
  });

  return axisChildren;
}

export function buildSettingsTree(
  config: PanelConfig,
  availableControllers: Gamepad[] = [],
): SettingsTreeNodes {

  const dataSourceFields: SettingsTreeFields = {
    dataSource: {
      label: "Data Source",
      input: "select",
      value: config.dataSource,
      help: "Choose which control input drives the output.",
      options: [
        {
          label: "Gamepad",
          value: "gamepad",
        },
        {
          label: "Joystick",
          value: "joystick",
        },
        {
          label: "Keyboard",
          value: "keyboard",
        },
      ],
    },
  };

  const joyFields: SettingsTreeFields = {
    publishJoy: {
      label: "Publish Joy",
      input: "boolean",
      value: config.publishJoy,
      help: "Enable publishing sensor_msgs/Joy messages on the configured Joy topic.",
    },
    pubJoyTopic: {
      label: "Joy Topic Name",
      input: "string",
      value: config.pubJoyTopic,
      help: "Topic name used when publishing sensor_msgs/Joy.",
    },
  };

  const twistFields: SettingsTreeFields = {
    publishTwistMode: {
      label: "Publish Twist",
      input: "boolean",
      value: config.publishTwistMode,
      help: "Enable publishing geometry_msgs/Twist converted from Joy inputs.",
    },
    pubTwistTopic: {
      label: "Twist Topic Name",
      input: "string",
      value: config.pubTwistTopic,
      help: "Topic name used when publishing geometry_msgs/Twist.",
    },
  };

  const gamepadFields: SettingsTreeFields = {
    gamepadId: {
      label: "Gamepad ID",
      input: "select",
      value: config.gamepadId.toString(),
      help: "Select which connected gamepad is used when Data Source is set to Gamepad.",
      options:
        availableControllers.length > 0
          ? availableControllers.map((gp: Gamepad) => ({
              label: `${gp.index}: ${gp.id.replace(/\s*\([^)]*\)\s*$/, "").trim()}`,
              value: gp.index.toString(),
            }))
          : [
              {
              label: `${config.gamepadId}: No gamepads connected`,
                value: config.gamepadId.toString(),
              },
            ],
    },
    gamepadJoyTransform: {
      label: "GP→Joy Mapping",
      input: "select",
      value: config.gamepadJoyTransform,
      options: Object.entries(getGamepadJoyTransformOptions()).map(([key, { label }]) => ({
        label,
        value: key,
      })),
      help: "Change how the gamepad axes and buttons are mapped to joy messages",
    },
  };

  const keyboardFields: SettingsTreeFields = {
    keyboardLayout: {
      label: "Keyboard Layout",
      input: "select",
      value: config.keyboardLayout,
      help: "Choose which keyboard key layout is used for keyboard control.",
      options: [
        { label: "WASD", value: "wasd" },
        { label: "Arrow Keys", value: "arrows" },
      ],
    },
  };

  const joystickFields: SettingsTreeFields = {
    joystickAxisLeft: {
      label: "Left Axis",
      input: "select",
      value: config.joystickAxisLeft,
      options: [
        { label: "Both", value: "both" },
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
      ],
      help: "Lock left joystick movement to X, Y, or allow both.",
    },
    joystickAxisRight: {
      label: "Right Axis",
      input: "select",
      value: config.joystickAxisRight,
      options: [
        { label: "Both", value: "both" },
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
      ],
      help: "Lock right joystick movement to X, Y, or allow both.",
      disabled: !config.joystickSecond,
    },
    joystickSticky: {
      label: "Sticky Mode",
      input: "boolean",
      value: config.joystickSticky,
      help: "Keep the joystick position when released instead of snapping back to center.",
    },
    joystickSecond: {
      label: "Second Joystick",
      input: "boolean",
      value: config.joystickSecond,
      help: "Show a second joystick in the joystick panel (useful for dual-stick control).",
    },
  };

  const visiblePanelsFields: SettingsTreeFields = {
    showGamepad: {
      label: "Show Gamepad",
      input: "boolean",
      value: config.showGamepad,
      help: "Show or hide the Gamepad control panel in the UI.",
    },
    showKeyboard: {
      label: "Show Keyboard",
      input: "boolean",
      value: config.showKeyboard,
      help: "Show or hide the Keyboard control panel in the UI.",
    },
    showJoystick: {
      label: "Show Joystick",
      input: "boolean",
      value: config.showJoystick,
      help: "Show or hide the Joystick control panel in the UI.",
    },
    showControlButtons: {
      label: "Show Panel Buttons",
      input: "boolean",
      value: config.showControlButtons,
      help: "Show or hide control buttons (power, settings, and side toggle) on all control panels.",
    },
  };

  const gamepadVisibleFields: SettingsTreeFields = {
    showGamepadRightSide: {
      label: "Show Right Side",
      input: "boolean",
      value: config.showGamepadRightSide,
      help: "Show or hide the right side of the Gamepad panel.",
    },
    gamepadVisualization: {
      label: "Visualization",
      input: "select",
      value: config.gamepadVisualization,
      options: [
        { label: "Auto", value: "auto" },
        { label: "Generic", value: "generic" },
        { label: "Xbox", value: "xbox" },
        { label: "DualSense (PS5)", value: "dualsense" },
      ],
      help: "Choose which controller visual to render, or keep Auto detection.",
    },
    showButtons: {
      label: "Show Buttons",
      input: "boolean",
      value: config.showButtons,
      help: "Show or hide button values in the Gamepad side panel.",
    },
    showAxes: {
      label: "Show Axes",
      input: "boolean",
      value: config.showAxes,
      help: "Show or hide axis visualization in the Gamepad side panel.",
    },
    axisVisualization: {
      label: "Axis Visualization",
      input: "select",
      value: config.axisVisualization,
      options: [
        { label: "Plots", value: "plots" },
        { label: "Bars", value: "bars" },
      ],
      disabled: !config.showAxes,
      help: "Choose whether axes are shown as stick pads or bars.",
    },
    gamepadDeadzoneEnabled: {
      label: "Stick Deadzone",
      input: "boolean",
      value: config.gamepadDeadzoneEnabled,
      help: "Enable or disable deadzone filtering for gamepad stick axes.",
    },
    gamepadDeadzone: {
      label: "Deadzone Value",
      input: "number",
      value: config.gamepadDeadzone,
      disabled: !config.gamepadDeadzoneEnabled,
      help: "Deadzone threshold between 0.00 and 0.99 for stick axis filtering.",
    },
  };

  const keyboardVisibleFields: SettingsTreeFields = {
    showKeyboardRightSide: {
      label: "Show Right Side",
      input: "boolean",
      value: config.showKeyboardRightSide,
      help: "Show or hide the right side of the Keyboard panel.",
    },
  };

  const joystickVisibleFields: SettingsTreeFields = {
    showJoystickRightSide: {
      label: "Show Right Side",
      input: "boolean",
      value: config.showJoystickRightSide,
      help: "Show or hide the right side of the Joystick panel.",
    },
    joystickSize: {
      label: "Size",
      input: "select",
      value: config.joystickSize,
      options: [
        { label: "auto", value: "auto" },
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
        { label: "xl", value: "xl" },
      ],
      help: "Choose joystick size, or Auto to scale with available space.",
    },
  };

  const currentGamepad = availableControllers.find((gp) => gp.index === config.gamepadId);
  const gamepadTwistMappingFields = buildTwistMappingFields(
    config.twistMappingGamepad,
    "twistMappingGamepad",
    currentGamepad,
  );
  const keyboardTwistMappingFields = buildTwistMappingFields(
    config.twistMappingKeyboard,
    "twistMappingKeyboard",
  );
  const joystickTwistMappingFields = buildTwistMappingFields(
    config.twistMappingJoystick,
    "twistMappingJoystick",
  );

  const gamepadTwistAxisChildren = buildTwistAxisChildren(
    "twistMappingGamepad",
    gamepadTwistMappingFields,
  );
  const keyboardTwistAxisChildren = buildTwistAxisChildren(
    "twistMappingKeyboard",
    keyboardTwistMappingFields,
  );
  const joystickTwistAxisChildren = buildTwistAxisChildren(
    "twistMappingJoystick",
    joystickTwistMappingFields,
  );

  const settings: SettingsTreeNodes = {
    visiblePanels: {
      label: "Display",
      fields: visiblePanelsFields,
      children: {
        gamepad: {
          label: "Gamepad",
          fields: gamepadVisibleFields,
        },
        keyboard: {
          label: "Keyboard",
          fields: keyboardVisibleFields,
        },
        joystick: {
          label: "Joystick",
          fields: joystickVisibleFields,
        },
      },
    },
    input: {
      label: "Input",
      children: {
        gamepad: {
          label: "Gamepad",
          fields: gamepadFields,
        },
        keyboard: {
          label: "Keyboard",
          fields: keyboardFields,
        },
        joystick: {
          label: "Joystick",
          fields: joystickFields,
        },
      },
    },
    output: {
      label: "Output",
      fields: dataSourceFields,
      children: {
        joy: {
          label: "Joy",
          fields: joyFields,
        },
        twist: {
          label: "Twist",
          fields: twistFields,
          children: {
            mapping: {
              label: "Mapping",
              children: {
                gamepad: {
                  label: "Gamepad",
                  children: gamepadTwistAxisChildren,
                },
                keyboard: {
                  label: "Keyboard",
                  children: keyboardTwistAxisChildren,
                },
                joystick: {
                  label: "Joystick",
                  children: joystickTwistAxisChildren,
                },
              },
            },
          },
        },
      },
    },
  };

  return settings;
}

export function buildSettingsTreeLite(
  config: PanelConfig,
  availableControllers: Gamepad[] = [],
): SettingsTreeNodes {
  const currentGamepadLabel =
    availableControllers.find((gp) => gp.index === config.gamepadId)?.id ?? "No gamepads connected";

  const dataSourceFields: SettingsTreeFields = {
    dataSource: {
      label: "Active Card",
      input: "select",
      value: config.dataSource,
      help: "Choose which control card is currently active in the Lite panel.",
      options: [
        { label: "Gamepad", value: "gamepad" },
        { label: "Joystick", value: "joystick" },
        { label: "Keyboard", value: "keyboard" },
      ],
    },
  };

  const displayFields: SettingsTreeFields = {
    showLiteTabBar: {
      label: "Show Top Tab Bar",
      input: "boolean",
      value: config.showLiteTabBar,
      help: "Show or hide the top tab selector in the Lite panel.",
    },
  };

  const gamepadFields: SettingsTreeFields = {
    gamepadId: {
      label: "Gamepad ID",
      input: "select",
      value: config.gamepadId.toString(),
      help: "Select which connected gamepad is used by the Lite Gamepad card.",
      options:
        availableControllers.length > 0
          ? availableControllers.map((gp: Gamepad) => ({
              label: `${gp.index}: ${gp.id.replace(/\s*\([^)]*\)\s*$/, "").trim()}`,
              value: gp.index.toString(),
            }))
          : [{ label: `${config.gamepadId}: ${currentGamepadLabel}`, value: config.gamepadId.toString() }],
    },
    gamepadJoyTransform: {
      label: "GP→Joy Mapping",
      input: "select",
      value: config.gamepadJoyTransform,
      options: Object.entries(getGamepadJoyTransformOptions()).map(([key, { label }]) => ({
        label,
        value: key,
      })),
      help: "Change how gamepad input is converted to Joy output.",
    },
    gamepadDeadzoneEnabled: {
      label: "Stick Deadzone",
      input: "boolean",
      value: config.gamepadDeadzoneEnabled,
      help: "Enable or disable deadzone filtering for gamepad stick axes.",
    },
    gamepadDeadzone: {
      label: "Deadzone Value",
      input: "number",
      value: config.gamepadDeadzone,
      disabled: !config.gamepadDeadzoneEnabled,
      help: "Deadzone threshold between 0.00 and 0.99 for stick axis filtering.",
    },
  };

  const joystickFields: SettingsTreeFields = {
    joystickSize: {
      label: "Size",
      input: "select",
      value: config.joystickSize,
      options: [
        { label: "auto", value: "auto" },
        { label: "xs", value: "xs" },
        { label: "sm", value: "sm" },
        { label: "md", value: "md" },
        { label: "lg", value: "lg" },
        { label: "xl", value: "xl" },
      ],
      help: "Choose joystick size, or Auto to scale with available space.",
    },
    joystickAxisLeft: {
      label: "Left Axis",
      input: "select",
      value: config.joystickAxisLeft,
      options: [
        { label: "Both", value: "both" },
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
      ],
      help: "Lock left joystick movement to X, Y, or allow both.",
    },
    joystickAxisRight: {
      label: "Right Axis",
      input: "select",
      value: config.joystickAxisRight,
      options: [
        { label: "Both", value: "both" },
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
      ],
      help: "Lock right joystick movement to X, Y, or allow both.",
      disabled: !config.joystickSecond,
    },
    joystickSticky: {
      label: "Sticky Mode",
      input: "boolean",
      value: config.joystickSticky,
      help: "Keep joystick position on release instead of snapping to center.",
    },
    joystickSecond: {
      label: "Second Joystick",
      input: "boolean",
      value: config.joystickSecond,
      help: "Enable dual-stick mode in the Lite Joystick card.",
    },
  };

  const keyboardFields: SettingsTreeFields = {
    keyboardLayout: {
      label: "Keyboard Layout",
      input: "select",
      value: config.keyboardLayout,
      options: [
        { label: "WASD", value: "wasd" },
        { label: "Arrow Keys", value: "arrows" },
      ],
      help: "Choose keyboard layout for the Lite Keyboard card.",
    },
  };

  const joyFields: SettingsTreeFields = {
    publishJoy: {
      label: "Publish Joy",
      input: "boolean",
      value: config.publishJoy,
      help: "Enable publishing sensor_msgs/Joy messages.",
    },
    pubJoyTopic: {
      label: "Joy Topic Name",
      input: "string",
      value: config.pubJoyTopic,
      help: "Topic used for Joy publishing.",
    },
  };

  const twistFields: SettingsTreeFields = {
    publishTwistMode: {
      label: "Publish Twist",
      input: "boolean",
      value: config.publishTwistMode,
      help: "Enable publishing geometry_msgs/Twist.",
    },
    pubTwistTopic: {
      label: "Twist Topic Name",
      input: "string",
      value: config.pubTwistTopic,
      help: "Topic used for Twist publishing.",
    },
  };

  return {
    display: {
      label: "Display",
      fields: displayFields,
    },
    input: {
      label: "Input",
      fields: dataSourceFields,
      children: {
        gamepad: { label: "Gamepad", fields: gamepadFields },
        joystick: { label: "Joystick", fields: joystickFields },
        keyboard: { label: "Keyboard", fields: keyboardFields },
      },
    },
    output: {
      label: "Output",
      children: {
        joy: { label: "Joy", fields: joyFields },
        twist: { label: "Twist", fields: twistFields },
      },
    },
  };
}

/**
 * Field suffixes that arrive as strings from the Foxglove settings editor but
 * must be stored as numbers in PanelConfig.
 */
const NUMBER_FIELD_SUFFIXES = new Set(["gamepadId", "sourceIndex", "scale", "gamepadDeadzone"]);

/**
 * Reducer for Foxglove SettingsTreeAction updates.
 * Node keys and coercion rules are derived from the tree definition above —
 * no manual maintenance required.
 */
export const settingsActionReducer = makeSettingsReducer<PanelConfig>(
  new Set([
    ...collectNodeKeys(buildSettingsTree(createDefaultConfig())),
    ...collectNodeKeys(buildSettingsTreeLite(createDefaultConfig())),
  ]),
  NUMBER_FIELD_SUFFIXES,
);
