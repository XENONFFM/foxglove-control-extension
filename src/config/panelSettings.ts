import { SettingsTreeAction, SettingsTreeFields, SettingsTreeNodes } from "@foxglove/extension";
import { produce } from "immer";
import * as _ from "lodash";

import { PanelConfig, PanelOptions } from "./types";
import { getGamepadJoyTransformOptions } from "@/mappings/gamepadJoyTransforms";

export function settingsActionReducer(
  prevConfig: PanelConfig,
  action: SettingsTreeAction,
): PanelConfig {
  return produce(prevConfig, (draft) => {
    if (action.action === "update") {
      const { path, value } = action.payload;
      const rawPath = path.slice(1).join(".");
      const pathSegments = rawPath.split(".").filter(Boolean);
      const settingsNodeSegments = new Set([
        "input",
        "output",
        "visiblePanels",
        "dataSource",
        "publish",
        "gamepad",
        "keyboard",
        "joystick",
        "twistMapping",
      ]);

      while (pathSegments.length > 0 && settingsNodeSegments.has(pathSegments[0]!)) {
        pathSegments.shift();
      }

      const pathString = pathSegments.join(".") || rawPath;
      const shouldParseNumber =
        typeof value === "string" &&
        (pathString.endsWith("gamepadId") ||
          pathString.endsWith("sourceIndex") ||
          pathString.endsWith("scale"));
      const normalizedValue = shouldParseNumber ? Number(value) : value;
      _.set(draft, pathString, normalizedValue);
    }
  });
}

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
  config: PanelConfig,
  currentGamepad?: Gamepad,
): SettingsTreeFields {
  const fields: SettingsTreeFields = {};

  twistFieldDefinitions.forEach(({ key, label }) => {
    const mapping = config.twistMapping[key as keyof typeof config.twistMapping];
    const basePath = `twistMapping.${key}`;
    const sourceIndexLabel = mapping.sourceType === "button" ? "Button" : "Axis";

    fields[`${basePath}.sourceType`] = {
      label: `${label} Source`,
      input: "select",
      value: mapping.sourceType,
      options: sourceTypeOptions,
      help: `Select whether ${label} comes from a joystick axis, a button, or is disabled.`,
    };

    if (mapping.sourceType === "none") {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} ${sourceIndexLabel}`,
        input: "number",
        value: mapping.sourceIndex,
        disabled: true,
        help: `${label} is disabled because Source is set to None.`,
      };
    } else if (currentGamepad && mapping.sourceType === "axis") {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} Axis`,
        input: "select",
        value: mapping.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.axes.length }, (_value, index) => ({
          label: `Axis ${index}`,
          value: index.toString(),
        })),
        help: `Choose which gamepad axis controls ${label}.`,
      };
    } else if (currentGamepad && mapping.sourceType === "button") {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} Button`,
        input: "select",
        value: mapping.sourceIndex.toString(),
        options: Array.from({ length: currentGamepad.buttons.length }, (_value, index) => ({
          label: `Button ${index}`,
          value: index.toString(),
        })),
        help: `Choose which gamepad button controls ${label}.`,
      };
    } else {
      fields[`${basePath}.sourceIndex`] = {
        label: `${label} ${sourceIndexLabel}`,
        input: "number",
        value: mapping.sourceIndex,
        help: `Set the ${sourceIndexLabel.toLowerCase()} index used for ${label}.`,
      };
    }

    fields[`${basePath}.scale`] = {
      label: `${label} Scale`,
      input: "number",
      value: mapping.scale,
      help: `Multiply ${label} input by this factor before publishing Twist.`,
    };

    fields[`${basePath}.invert`] = {
      label: `${label} Invert`,
      input: "boolean",
      value: mapping.invert,
      help: `Invert the sign of ${label} input before publishing Twist.`,
    };
  });

  return fields;
}

export function buildSettingsTree(config: PanelConfig): SettingsTreeNodes {
  const options: PanelOptions = config.options;

  const dataSourceFields: SettingsTreeFields = {
    dataSource: {
      label: "Data Source",
      input: "select",
      value: config.dataSource,
      help: "Choose which control input drives the Joy data (Gamepad, Joystick, or Keyboard).",
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

  const publishFields: SettingsTreeFields = {
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
      options: options.availableControllers.map((gp: Gamepad) => ({
        label: gp.id,
        value: gp.index.toString(),
      })),
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
    joystickAxis: {
      label: "Enabled Axis",
      input: "select",
      value: config.joystickAxis,
      options: [
        { label: "Both", value: "both" },
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
      ],
      help: "Limit joystick movement to the X axis, Y axis, or allow both.",
    },
    joystickSticky: {
      label: "Sticky Mode",
      input: "boolean",
      value: config.joystickSticky,
      help: "Keep the joystick position when released instead of snapping back to center.",
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
  };

  const gamepadVisibleFields: SettingsTreeFields = {
    showGamepadRightSide: {
      label: "Show Right Side",
      input: "boolean",
      value: config.showGamepadRightSide,
      help: "Show or hide the right side of the Gamepad panel.",
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
  };

  const currentGamepad =
    config.dataSource === "gamepad"
      ? options.availableControllers.find((gp) => gp.index === config.gamepadId)
      : undefined;
  const twistMappingFields = buildTwistMappingFields(config, currentGamepad);
  const twistMappingFieldsWithPublishState: SettingsTreeFields = {};
  Object.entries(twistMappingFields).forEach(([key, field]) => {
    if (field) {
      twistMappingFieldsWithPublishState[key] = {
        ...field,
        disabled: config.publishTwistMode ? field.disabled : true,
      };
    }
  });

  const settings: SettingsTreeNodes = {
    visiblePanels: {
      label: "Visible Panels",
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
      fields: dataSourceFields,
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
      fields: publishFields,
      children: {
        twistMapping: {
          label: "Twist Mapping",
          fields: twistMappingFieldsWithPublishState,
        },
      },
    },
  };

  return settings;
}
